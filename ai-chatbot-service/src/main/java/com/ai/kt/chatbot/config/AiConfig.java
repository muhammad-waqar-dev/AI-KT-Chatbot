package com.ai.kt.chatbot.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaStreamingChatModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
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

    @Value("${langchain4j.ollama.embedding-model.model-name}")
    private String embeddingModelName;

    @Value("${chatbot.qdrant.url}")
    private String qdrantUrl;

    @Value("${chatbot.qdrant.api-key}")
    private String qdrantApiKey;

    @Value("${chatbot.qdrant.collection-name}")
    private String qdrantCollectionName;

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
                .timeout(Duration.ofMinutes(5))
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return OllamaEmbeddingModel.builder()
                .baseUrl(baseUrl)
                .modelName(embeddingModelName)
                .timeout(Duration.ofMinutes(5))
                .build();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        return QdrantEmbeddingStore.builder()
                .host(qdrantUrl.replace("https://", "").split(":")[0])
                .port(6334)
                .apiKey(qdrantApiKey)
                .collectionName(qdrantCollectionName)
                .useTls(true)
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
        return MessageWindowChatMemory.withMaxMessages(10);
    }
}
