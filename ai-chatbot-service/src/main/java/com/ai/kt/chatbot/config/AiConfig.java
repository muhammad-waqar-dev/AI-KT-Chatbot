package com.ai.kt.chatbot.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2q.AllMiniLmL6V2QuantizedEmbeddingModel;
import dev.langchain4j.model.ollama.OllamaStreamingChatModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;
import java.time.Duration;

@Configuration
public class AiConfig {

    @Value("${langchain4j.ollama.chat-model.base-url}")
    private String baseUrl;

    @Value("${langchain4j.ollama.chat-model.model-name}")
    private String modelName;

    @Value("${chatbot.qdrant.url}")
    private String qdrantUrl;

    @Value("${chatbot.qdrant.api-key}")
    private String qdrantApiKey;

    @Value("${chatbot.qdrant.collection-name}")
    private String qdrantCollectionName;

    @Value("${chatbot.qdrant.port:6334}")
    private int qdrantPort;

    @Value("${chatbot.qdrant.use-tls:false}")
    private boolean qdrantUseTls;

    @Value("${chatbot.chat-memory.max-messages:10}")
    private int maxMessages;

    @Value("${chatbot.minio.access-key}")
    private String minioAccessKey;

    @Value("${chatbot.minio.secret-key}")
    private String minioSecretKey;

    @Value("${chatbot.minio.endpoint}")
    private String minioEndpoint;

    @Value("${chatbot.minio.region}")
    private String minioRegion;

    @Bean
    public StreamingChatLanguageModel streamingChatLanguageModel() {
        return OllamaStreamingChatModel.builder()
                .baseUrl(baseUrl)
                .modelName(modelName)
                .timeout(Duration.ofMinutes(10))
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        // Run embeddings locally inside the JVM (Fast, no network calls, 384 dimensions)
        return new AllMiniLmL6V2QuantizedEmbeddingModel();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        // Clean the URL to get only the hostname
        String host = qdrantUrl.replace("https://", "").replace("http://", "");
        if (host.contains(":")) {
            host = host.split(":")[0];
        }
        if (host.endsWith("/")) {
            host = host.substring(0, host.length() - 1);
        }

        System.out.println("Connecting to Qdrant Local Host: " + host);

        return QdrantEmbeddingStore.builder()
                .host(host)
                .port(qdrantPort)
                .apiKey(qdrantApiKey)
                .collectionName(qdrantCollectionName)
                .useTls(qdrantUseTls)
                .build();
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(minioRegion))
                .endpointOverride(URI.create(minioEndpoint))
                .forcePathStyle(true) // Required for MinIO
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(minioAccessKey, minioSecretKey)))
                .build();
    }

    @Bean
    public ChatMemory chatMemory() {
        return MessageWindowChatMemory.withMaxMessages(maxMessages);
    }
}
