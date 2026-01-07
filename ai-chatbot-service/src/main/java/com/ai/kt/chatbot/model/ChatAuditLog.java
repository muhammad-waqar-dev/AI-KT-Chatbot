package com.ai.kt.chatbot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_audit_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "master_name", nullable = false)
    private String masterName;

    @Column(name = "user_prompt", columnDefinition = "TEXT")
    private String userPrompt;

    @Column(name = "llm_response", columnDefinition = "TEXT")
    private String llmResponse;

    @Column(name = "document_references", columnDefinition = "TEXT")
    private String documentReferences;

    @CreationTimestamp
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}


