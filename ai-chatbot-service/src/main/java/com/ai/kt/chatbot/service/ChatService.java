package com.ai.kt.chatbot.service;

import com.ai.kt.chatbot.model.Master;
import com.ai.kt.chatbot.repository.MasterRepository;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentParser;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import dev.langchain4j.data.document.parser.apache.poi.ApachePoiDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.TokenStream;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.store.embedding.filter.Filter;
import dev.langchain4j.store.embedding.filter.MetadataFilterBuilder;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final StreamingChatLanguageModel streamingChatLanguageModel;
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final ChatMemory chatMemory;
    private final MasterRepository masterRepository;

    @Value("${chatbot.system-message-template:You are a Senior %s Expert. Your job is to help developers understand the project using ONLY the provided context. If the answer is not in the context, say: 'I don't have specific project knowledge on this yet.' Be concise, professional, and use formatting like bold text and headings.}")
    private String systemMessageTemplate;

    @Value("${chatbot.persistence.embedding-store.path:embeddings.json}")
    private String embeddingStorePath;

    @Value("${chatbot.rag.max-results:3}")
    private int maxResults;

    @Value("${chatbot.rag.min-score:0.6}")
    private double minScore;

    @PostConstruct
    public void init() {
        if (masterRepository.findAllByIsDeletedFalse().isEmpty()) {
            addMaster("Todo App");
        }
    }

    private void saveEmbeddingStore() {
        if (embeddingStore instanceof InMemoryEmbeddingStore) {
            ((InMemoryEmbeddingStore<TextSegment>) embeddingStore).serializeToFile(new File(embeddingStorePath).toPath());
        }
    }

    public interface Assistant {
        TokenStream chat(String message);
    }

    public List<String> getMasters() {
        return masterRepository.findAllByIsDeletedFalse().stream()
                .filter(Master::isActive)
                .map(Master::getMasterName)
                .collect(Collectors.toList());
    }

    public List<Master> getMastersObjects() {
        return masterRepository.findAllByIsDeletedFalse();
    }

    public void addMaster(String name) {
        if (masterRepository.findByMasterName(name).isEmpty()) {
            Master master = Master.builder()
                    .masterName(name)
                    .isActive(true)
                    .isDeleted(false)
                    .build();
            masterRepository.save(master);
        }
    }

    public void deleteMaster(String masterName) {
        masterRepository.findByMasterName(masterName).ifPresent(master -> {
            master.setDeleted(true);
            masterRepository.save(master);
            System.out.println("Master [" + masterName + "] marked as deleted in DB.");
        });
    }

    public void updateMaster(String oldName, String newName, Boolean isActive) {
        masterRepository.findByMasterName(oldName).ifPresent(master -> {
            if (newName != null && !newName.isBlank()) {
                master.setMasterName(newName);
            }
            if (isActive != null) {
                master.setActive(isActive);
            }
            masterRepository.save(master);
            System.out.println("Master [" + oldName + "] updated in DB.");
        });
    }

    public TokenStream chat(String message, String masterName) {
        Assistant assistant = createAssistantForMaster(masterName);
        System.out.println("Processing User Message for Master [" + masterName + "]: " + message);
        return assistant.chat(message);
    }

    private Assistant createAssistantForMaster(String masterName) {
        // Create a filter to only retrieve segments belonging to this master
        Filter filter = MetadataFilterBuilder.metadataKey("master_name").isEqualTo(masterName);

        ContentRetriever contentRetriever = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(maxResults)
                .minScore(minScore)
                .filter(filter) // Apply the filter
                .build();

        String systemMessage = String.format(systemMessageTemplate, masterName);

        return AiServices.builder(Assistant.class)
                .streamingChatLanguageModel(streamingChatLanguageModel)
                .chatMemory(chatMemory)
                .contentRetriever(contentRetriever)
                .systemMessageProvider(chatMemoryId -> systemMessage)
                .build();
    }

    public void ingestDocument(MultipartFile file, String masterName) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName == null) return;

        Path tempFile = Files.createTempFile("kt-doc-", fileName);
        file.transferTo(tempFile);

        DocumentParser parser = getParser(fileName);

        try {
            Document document = FileSystemDocumentLoader.loadDocument(tempFile, parser);
            // Add metadata to the document
            document.metadata().add("master_name", masterName);

            validateAndIngest(document, masterName);
        } finally {
            Files.delete(tempFile);
        }
    }

    public void ingestText(String text, String masterName) {
        Document document = Document.from(text);
        document.metadata().add("master_name", masterName);
        validateAndIngest(document, masterName);
    }

    private void validateAndIngest(Document document, String masterName) {
        long wordCount = document.text().trim().isEmpty() ? 0 : document.text().split("\\s+").length;
        
        if (wordCount > 50000) {
            throw new IllegalArgumentException("Content too large! Max 50,000 words.");
        }

        DocumentSplitter splitter = DocumentSplitters.recursive(1000, 100);
        
        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .documentSplitter(splitter)
                .embeddingModel(embeddingModel)
                .embeddingStore(embeddingStore)
                .build();

        ingestor.ingest(document);
        addMaster(masterName);
        saveEmbeddingStore();
    }

    private DocumentParser getParser(String fileName) {
        if (fileName.toLowerCase().endsWith(".pdf")) return new ApachePdfBoxDocumentParser();
        if (fileName.toLowerCase().endsWith(".docx") || fileName.toLowerCase().endsWith(".doc")) return new ApachePoiDocumentParser();
        return new TextDocumentParser();
    }
}
