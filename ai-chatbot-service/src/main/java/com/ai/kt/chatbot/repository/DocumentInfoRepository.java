package com.ai.kt.chatbot.repository;

import com.ai.kt.chatbot.model.DocumentInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentInfoRepository extends JpaRepository<DocumentInfo, Long> {
    List<DocumentInfo> findAllByMasterId(Long masterId);
}


