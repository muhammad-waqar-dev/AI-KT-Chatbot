package com.ai.kt.chatbot.repository;

import com.ai.kt.chatbot.model.Master;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterRepository extends JpaRepository<Master, Long> {
    Optional<Master> findByMasterName(String masterName);
    List<Master> findAllByIsDeletedFalse();
}



