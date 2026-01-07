package com.ai.kt.chatbot.service;

import com.ai.kt.chatbot.model.ChatAuditLog;
import com.ai.kt.chatbot.model.DocumentInfo;
import com.ai.kt.chatbot.model.Master;
import com.ai.kt.chatbot.repository.ChatAuditLogRepository;
import com.ai.kt.chatbot.repository.DocumentInfoRepository;
import com.ai.kt.chatbot.repository.MasterRepository;
import com.ai.kt.chatbot.utils.ChunkingUtils;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentParser;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import dev.langchain4j.data.document.parser.apache.poi.ApachePoiDocumentParser;
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
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.IOException;
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
    private final ChatAuditLogRepository auditLogRepository;
    private final DocumentInfoRepository documentInfoRepository;
    private final ChunkingUtils chunkingUtils;
    private final S3Client s3Client;

    @Value("${chatbot.system-message-template}")
    private String systemMessageTemplate;

    @Value("${chatbot.rag.max-results:3}")
    private int maxResults;

    @Value("${chatbot.rag.min-score:0.6}")
    private double minScore;

    @Value("${chatbot.minio.bucket-name}")
    private String bucketName;

    @PostConstruct
    public void init() {
        if (masterRepository.findAllByIsDeletedFalse().isEmpty()) {
            addMaster("Todo App", "System");
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

    public void addMaster(String name, String userName) {
        if (masterRepository.findByMasterName(name).isEmpty()) {
            Master master = Master.builder()
                    .masterName(name)
                    .userName(userName)
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

    public void updateMaster(String oldName, String newName, Boolean isActive, String userName) {
        masterRepository.findByMasterName(oldName).ifPresent(master -> {
            if (newName != null && !newName.isBlank()) {
                master.setMasterName(newName);
            }
            if (isActive != null) {
                master.setActive(isActive);
            }
            if (userName != null && !userName.isBlank()) {
                master.setUserName(userName);
            }
            masterRepository.save(master);
            System.out.println("Master [" + oldName + "] updated in DB.");
        });
    }

    public TokenStream chat(String message, String masterName) {
        Assistant assistant = createAssistantForMaster(masterName);
        System.out.println("Processing User Message for Master [" + masterName + "]: " + message);
        
        StringBuilder fullResponse = new StringBuilder();
        return assistant.chat(message)
                .onNext(fullResponse::append)
                .onComplete(response -> {
                    // Log the interaction to PostgreSQL Audit Log
                    ChatAuditLog auditLog = ChatAuditLog.builder()
                            .masterName(masterName)
                            .userPrompt(message)
                            .llmResponse(fullResponse.toString())
                            .build();
                    auditLogRepository.save(auditLog);
                });
    }

    private Assistant createAssistantForMaster(String masterName) {
        Filter filter = MetadataFilterBuilder.metadataKey("master_name").isEqualTo(masterName);

        ContentRetriever contentRetriever = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(maxResults)
                .minScore(minScore)
                .filter(filter)
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

        Master master = masterRepository.findByMasterName(masterName)
                .orElseThrow(() -> new IllegalArgumentException("Master not found: " + masterName));

        // 1. Upload to MinIO
        String s3Key = "docs/" + master.getId() + "/" + UUID.randomUUID() + "-" + fileName;
        s3Client.putObject(PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build(), RequestBody.fromBytes(file.getBytes()));
        
        String uploadedUrl = String.format("/%s/%s", bucketName, s3Key);

        // 2. Save Metadata to PostgreSQL
        DocumentInfo docInfo = DocumentInfo.builder()
                .master(master)
                .fileName(fileName)
                .docType(getFileType(fileName))
                .uploadedUrl(uploadedUrl)
                .build();
        documentInfoRepository.save(docInfo);

        // 3. Ingest to Qdrant Cloud
        Path tempFile = Files.createTempFile("kt-doc-", fileName);
        file.transferTo(tempFile);
        DocumentParser parser = getParser(fileName);

        try {
            Document document = FileSystemDocumentLoader.loadDocument(tempFile, parser);
            document.metadata().add("master_name", masterName);
            document.metadata().add("doc_id", docInfo.getId().toString());
            document.metadata().add("file_type", docInfo.getDocType());

            validateAndIngest(document, masterName, fileName);
        } finally {
            Files.delete(tempFile);
        }
    }

    public void ingestText(String text, String masterName) {
        Document document = Document.from(text);
        document.metadata().add("master_name", masterName);
        document.metadata().add("file_type", "raw_text");
        validateAndIngest(document, masterName, "raw_text.txt");
    }

    private void validateAndIngest(Document document, String masterName, String fileName) {
        long wordCount = document.text().trim().isEmpty() ? 0 : document.text().split("\\s+").length;
        
        if (wordCount > 50000) {
            throw new IllegalArgumentException("Content too large! Max 50,000 words.");
        }

        // Use new dynamic Chunking Utility
        DocumentSplitter splitter = chunkingUtils.getSplitter(fileName);
        
        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .documentSplitter(splitter)
                .embeddingModel(embeddingModel)
                .embeddingStore(embeddingStore)
                .build();

        ingestor.ingest(document);
        addMaster(masterName, "System");
    }

    private String getFileType(String fileName) {
        if (fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf(".") + 1);
        }
        return "unknown";
    }

    private DocumentParser getParser(String fileName) {
        if (fileName.toLowerCase().endsWith(".pdf")) return new ApachePdfBoxDocumentParser();
        if (fileName.toLowerCase().endsWith(".docx") || fileName.toLowerCase().endsWith(".doc")) return new ApachePoiDocumentParser();
        return new TextDocumentParser();
    }
}
