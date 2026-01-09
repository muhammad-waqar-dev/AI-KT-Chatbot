package com.ai.kt.chatbot.controller;

import com.ai.kt.chatbot.model.Master;
import com.ai.kt.chatbot.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "${chatbot.cors.allowed-origins:http://localhost:3000}", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ChatController {

    private final ChatService chatService;

    @Value("${chatbot.default-master-name:Fusion}")
    private String defaultMasterName;

    @Value("${chatbot.sse.timeout:0}")
    private Long sseTimeout;

    @Value("${chatbot.ingestion.anonymous-user:Anonymous}")
    private String anonymousUser;

    @GetMapping("/masters")
    public ResponseEntity<List<Master>> getMasters() {
        return ResponseEntity.ok(chatService.getMastersObjects());
    }

    @GetMapping("/masters/{id}/documents")
    public ResponseEntity<List<Map<String, Object>>> getDocuments(@PathVariable Long id) {
        List<com.ai.kt.chatbot.model.DocumentInfo> docs = chatService.getDocumentsByMasterId(id);
        List<Map<String, Object>> result = docs.stream().map(doc -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", doc.getId());
            map.put("fileName", doc.getFileName());
            map.put("docType", doc.getDocType());
            map.put("createdAt", doc.getCreatedAt());
            return map;
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/masters/{id}/fragmentation")
    public ResponseEntity<List<Map<String, Object>>> getFragmentation(@PathVariable Long id) {
        // Return actual chunks and embeddings
        return ResponseEntity.ok(chatService.getFragmentationData(id));
    }

    @DeleteMapping("/fragments")
    public ResponseEntity<Map<String, String>> deleteFragments(@RequestBody List<String> ids) {
        chatService.deleteFragments(ids);
        return ResponseEntity.ok(Map.of("message", ids.size() + " fragments deleted successfully"));
    }

    @DeleteMapping("/fragments/{id}")
    public ResponseEntity<Map<String, String>> deleteFragment(@PathVariable String id) {
        chatService.deleteFragments(java.util.List.of(id));
        return ResponseEntity.ok(Map.of("message", "Fragment deleted successfully"));
    }

    @DeleteMapping("/masters/{masterId}/documents/{docId}")
    public ResponseEntity<Map<String, String>> deleteDocument(@PathVariable Long masterId, @PathVariable Long docId) {
        chatService.deleteDocument(masterId, docId);
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }

    @GetMapping("/masters/{masterId}/documents/{docId}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadDocument(@PathVariable Long masterId, @PathVariable Long docId) {
        return chatService.downloadDocument(masterId, docId);
    }

    @DeleteMapping("/masters/{name}")
    public ResponseEntity<Map<String, String>> deleteMaster(@PathVariable String name) {
        chatService.deleteMaster(name);
        return ResponseEntity.ok(Map.of("message", "Master deleted successfully"));
    }

    @PutMapping("/masters/{oldName}")
    public ResponseEntity<Map<String, String>> updateMaster(
            @PathVariable String oldName,
            @RequestBody Map<String, Object> request) {
        String newName = (String) request.get("name");
        Boolean isActive = (Boolean) request.get("isActive");
        String userName = (String) request.get("userName");
        String iconUrl = (String) request.get("iconUrl");
        
        chatService.updateMaster(oldName, newName, isActive, userName, iconUrl);
        return ResponseEntity.ok(Map.of("message", "Master updated successfully"));
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestBody Map<String, String> request) {
        SseEmitter emitter = new SseEmitter(sseTimeout);
        String message = request.get("message");
        String masterName = request.getOrDefault("masterName", defaultMasterName);

        chatService.chat(message, masterName)
                .onNext(token -> {
                    try {
                        emitter.send(token);
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                })
                .onComplete(c -> emitter.complete())
                .onError(e -> {
                    e.printStackTrace();
                    emitter.completeWithError(e);
                })
                .start();

        return emitter;
    }

    @PostMapping("/masters")
    public ResponseEntity<Map<String, String>> createMaster(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String userName = request.get("userName");
        String iconUrl = request.get("iconUrl");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Master name is required"));
        }
        chatService.addMaster(name, userName != null ? userName : anonymousUser, iconUrl);
        return ResponseEntity.ok(Map.of("message", "Master created successfully"));
    }

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, String>> ingest(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam("masterName") String masterName) {
        try {
            if (file != null) {
                chatService.ingestDocument(file, masterName);
            } else if (text != null) {
                chatService.ingestText(text, masterName);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Either file or text must be provided."));
            }
            return ResponseEntity.ok(Map.of("message", "Knowledge indexed for " + masterName));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal Error: " + e.getMessage()));
        }
    }
}
