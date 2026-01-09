package com.ai.kt.chatbot.repository;

import com.ai.kt.chatbot.model.ChatAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatAuditLogRepository extends JpaRepository<ChatAuditLog, Long> {
}


