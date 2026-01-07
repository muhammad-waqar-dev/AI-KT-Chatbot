package com.ai.kt.chatbot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "document_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = GenerationType.LAZY)
    @JoinColumn(name = "master_id")
    private Master master;

    @Column(name = "doc_type")
    private String docType;

    @Column(name = "uploaded_url", length = 1024)
    private String uploadedUrl;

    @Column(name = "file_name")
    private String fileName;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}


