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

    @Value("${text_area_ingesion_wordCount:50000}")
    private long textAreaWordLimit;

    @Value("${chatbot.default-master-name:Fusion}")
    private String defaultMasterName;

    @Value("${chatbot.default-system-user:System}")
    private String defaultSystemUser;

    @Value("${chatbot.ingestion.temp-file-prefix:kt-doc-}")
    private String tempFilePrefix;

    @Value("${chatbot.ingestion.raw-text-filename:raw_text.txt}")
    private String rawTextFilename;

    @PostConstruct
    public void init() {
        if (masterRepository.findAllByIsDeletedFalse().isEmpty()) {
            addMaster(defaultMasterName, defaultSystemUser, null);
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

    public void addMaster(String name, String userName, String iconUrl) {
        if (masterRepository.findByMasterName(name).isEmpty()) {
            Master master = Master.builder()
                    .masterName(name)
                    .userName(userName)
                    .iconUrl(iconUrl)
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

    public void updateMaster(String oldName, String newName, Boolean isActive, String userName, String iconUrl) {
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
            if (iconUrl != null) {
                master.setIconUrl(iconUrl);
            }
            masterRepository.save(master);
            System.out.println("Master [" + oldName + "] updated in DB.");
        });
    }

    public List<DocumentInfo> getDocumentsByMasterId(Long masterId) {
        return documentInfoRepository.findAllByMasterId(masterId);
    }

    public void deleteDocument(Long masterId, Long docId) {
        DocumentInfo docInfo = documentInfoRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + docId));

        if (!docInfo.getMaster().getId().equals(masterId)) {
            throw new IllegalArgumentException("Document does not belong to the specified master");
        }

        // 1. Delete from MinIO
        String s3Key = docInfo.getS3Key();
        if (s3Key == null || s3Key.isBlank()) {
            s3Key = docInfo.getUploadedUrl();
            if (s3Key != null && s3Key.startsWith("/" + bucketName + "/")) {
                s3Key = s3Key.substring(bucketName.length() + 2);
            }
        }

        if (s3Key != null && !s3Key.isBlank()) {
            try {
                System.out.println("Deleting from MinIO: " + s3Key);
                s3Client.deleteObject(software.amazon.awssdk.services.s3.model.DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3Key)
                        .build());
            } catch (Exception e) {
                System.err.println("Warning: Failed to delete file from MinIO: " + e.getMessage());
            }
        }

        // 2. Delete from DB
        documentInfoRepository.deleteById(docId);
    }

    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadDocument(Long masterId, Long docId) {
        DocumentInfo docInfo = documentInfoRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + docId));

        if (!docInfo.getMaster().getId().equals(masterId)) {
            throw new IllegalArgumentException("Document does not belong to the specified master");
        }

        String s3Key = docInfo.getS3Key();
        // Fallback for older records if s3Key is null
        if (s3Key == null || s3Key.isBlank()) {
            s3Key = docInfo.getUploadedUrl();
            if (s3Key != null && s3Key.startsWith("/" + bucketName + "/")) {
                s3Key = s3Key.substring(bucketName.length() + 2);
            }
        }

        System.out.println("Attempting to download from MinIO. Bucket: [" + bucketName + "], Key: [" + s3Key + "]");

        try {
            software.amazon.awssdk.services.s3.model.GetObjectRequest getObjectRequest = software.amazon.awssdk.services.s3.model.GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            byte[] content = s3Client.getObjectAsBytes(getObjectRequest).asByteArray();
            org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(content);

            return org.springframework.http.ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + docInfo.getFileName() + "\"")
                    .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(content.length)
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to download file from storage: " + e.getMessage());
        }
    }

    @Value("${chatbot.qdrant.url}")
    private String qdrantUrl;

    @Value("${chatbot.qdrant.collection-name}")
    private String qdrantCollectionName;

    public List<Map<String, Object>> getFragmentationData(Long masterId) {
        Master masterEntity = masterRepository.findById(masterId)
                .orElseThrow(() -> new IllegalArgumentException("Master not found with ID: " + masterId));
        
        String masterName = masterEntity.getMasterName();
        System.out.println("Fetching Fragmentation for Master ID: [" + masterId + "] Name: [" + masterName + "]");
        
        // 1. Get all DocumentInfo for this master to build a lookup map
        Map<String, DocumentInfo> docLookup = documentInfoRepository.findAllByMasterId(masterId)
                .stream()
                .collect(Collectors.toMap(d -> d.getId().toString(), d -> d));

        // 2. Query Qdrant for points matching this master using direct REST call for vectors
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String scrollUrl = qdrantUrl + "/collections/" + qdrantCollectionName + "/points/scroll";
            
            Map<String, Object> filter = Map.of(
                "must", List.of(
                    Map.of("key", "master_name", "match", Map.of("value", masterName))
                )
            );
            
            Map<String, Object> request = Map.of(
                "filter", filter,
                "limit", 100,
                "with_payload", true,
                "with_vector", true
            );

            Map<String, Object> response = restTemplate.postForObject(scrollUrl, request, Map.class);
            List<Map<String, Object>> points = (List<Map<String, Object>>) ((Map<String, Object>) response.get("result")).get("points");

            return points.stream().map(p -> {
                Map<String, Object> payload = (Map<String, Object>) p.get("payload");
                String docId = (String) payload.get("doc_id");
                DocumentInfo doc = docLookup.get(docId);
                String text = (String) payload.get("text");
                List<Double> vector = (List<Double>) p.get("vector");

                Map<String, Object> frag = new HashMap<>();
                frag.put("id", p.get("id")); // Include the Qdrant point ID
                frag.put("fileName", doc != null ? doc.getFileName() : "Direct Text");
                frag.put("uploadedDate", doc != null ? doc.getCreatedAt() : "N/A");
                frag.put("text", text);
                frag.put("chunkSize", text != null ? text.length() : 0);
                frag.put("dimension", vector != null ? vector.size() : 0);
                frag.put("docType", payload.get("file_type"));
                frag.put("embeddings", vector);
                return frag;
            }).collect(Collectors.toList());

        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public void deleteFragments(List<String> pointIds) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String deleteUrl = qdrantUrl + "/collections/" + qdrantCollectionName + "/points/delete";
            
            Map<String, Object> request = Map.of(
                "points", pointIds
            );

            restTemplate.postForObject(deleteUrl, request, Map.class);
            System.out.println("Deleted [" + pointIds.size() + "] fragments from Qdrant.");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to delete fragments from Qdrant: " + e.getMessage());
        }
    }

    public TokenStream chat(String message, String masterName) {
        Assistant assistant = createAssistantForMaster(masterName);
        System.out.println("Processing User Message for Master [" + masterName + "]: " + message);
        
        StringBuilder fullResponse = new StringBuilder();
        TokenStream tokenStream = assistant.chat(message);

        // Attach listeners for logging
        tokenStream.onNext(fullResponse::append)
                .onComplete(response -> {
                    ChatAuditLog auditLog = ChatAuditLog.builder()
                            .masterName(masterName)
                            .userPrompt(message)
                            .llmResponse(fullResponse.toString())
                            .build();
                    auditLogRepository.save(auditLog);
                })
                .onError(Throwable::printStackTrace);

        return tokenStream;
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

        byte[] fileBytes = file.getBytes(); // Read once
        if (fileBytes.length == 0) {
            throw new IllegalArgumentException("File is empty: " + fileName);
        }

        Master master = masterRepository.findByMasterName(masterName)
                .orElseThrow(() -> new IllegalArgumentException("Master not found: " + masterName));

        // 1. Upload to MinIO
        String sanitizedMasterName = masterName.replaceAll("[^a-zA-Z0-9-_]", "_").toLowerCase();
        String timestamp = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss").format(java.time.LocalDateTime.now());
        
        String rawBaseName = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf(".")) : fileName;
        // Sanitize the filename: replace spaces and special characters with underscores
        String sanitizedBaseName = rawBaseName.replaceAll("[^a-zA-Z0-9-_]", "_");
        String extension = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".")) : "";
        String s3Key = sanitizedMasterName + "/" + sanitizedBaseName + "-" + timestamp + extension;
        
        System.out.println("Uploading to MinIO: " + s3Key);
        s3Client.putObject(PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build(), RequestBody.fromBytes(fileBytes));
        
        String uploadedUrl = String.format("/%s/%s", bucketName, s3Key);

        // 2. Save Metadata to PostgreSQL
        DocumentInfo docInfo = DocumentInfo.builder()
                .master(master)
                .fileName(fileName)
                .docType(getFileType(fileName))
                .uploadedUrl(uploadedUrl)
                .s3Key(s3Key)
                .build();
        documentInfoRepository.save(docInfo);

        // 3. Ingest to Qdrant Cloud
        String suffix = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".")) : ".tmp";
        if (suffix.length() < 3) suffix = ".tmp"; // Ensure valid suffix for createTempFile
        
        Path tempFile = Files.createTempFile(tempFilePrefix, suffix);
        
        try {
            Files.write(tempFile, fileBytes);
            System.out.println("Processing file: " + fileName + " (Path: " + tempFile + ", Size: " + fileBytes.length + " bytes)");
            
            DocumentParser parser = getParser(fileName);
            Document document = FileSystemDocumentLoader.loadDocument(tempFile, parser);
            
            document.metadata().add("master_name", masterName);
            document.metadata().add("doc_id", docInfo.getId().toString());
            document.metadata().add("file_type", docInfo.getDocType());

            validateAndIngest(document, masterName, fileName);
            System.out.println("Successfully ingested: " + fileName);
        } catch (Exception e) {
            System.err.println("Error during ingestion of " + fileName + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    public void ingestText(String text, String masterName) {
        Document document = Document.from(text);
        document.metadata().add("master_name", masterName);
        document.metadata().add("file_type", "raw_text");
        validateAndIngest(document, masterName, rawTextFilename);
    }

    private void validateAndIngest(Document document, String masterName, String fileName) {
        long wordCount = document.text().trim().isEmpty() ? 0 : document.text().split("\\s+").length;
        
        if (wordCount > textAreaWordLimit) {
            throw new IllegalArgumentException("Content too large! Max " + String.format("%,d", textAreaWordLimit) + " words.");
        }

        // Use new dynamic Chunking Utility
        DocumentSplitter splitter = chunkingUtils.getSplitter(fileName);
        
        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .documentSplitter(splitter)
                .embeddingModel(embeddingModel)
                .embeddingStore(embeddingStore)
                .build();

        ingestor.ingest(document);
        addMaster(masterName, defaultSystemUser, null);
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
