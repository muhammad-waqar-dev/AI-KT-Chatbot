package com.ai.kt.chatbot.controller;

import com.ai.kt.chatbot.model.Master;
import com.ai.kt.chatbot.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/masters")
    public ResponseEntity<List<Master>> getMasters() {
        return ResponseEntity.ok(chatService.getMastersObjects());
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
        
        chatService.updateMaster(oldName, newName, isActive);
        return ResponseEntity.ok(Map.of("message", "Master updated successfully"));
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestBody Map<String, String> request) {
        SseEmitter emitter = new SseEmitter(0L);
        String message = request.get("message");
        String masterName = request.getOrDefault("masterName", "Todo App");

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
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Master name is required"));
        }
        chatService.addMaster(name);
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
