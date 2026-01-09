package com.ai.kt.chatbot.utils;

import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ChunkingUtils {

    @Value("${chatbot.chunking.kt-docs.size:800}")
    private int ktDocsSize;

    @Value("${chatbot.chunking.code.size:500}")
    private int codeSize;

    @Value("${chatbot.chunking.business-rules.size:400}")
    private int businessRulesSize;

    @Value("${chatbot.chunking.overlap:100}")
    private int overlap;

    public DocumentSplitter getSplitter(String fileName) {
        String lowerCaseName = fileName.toLowerCase();
        
        int size = ktDocsSize; // Default
        
        if (lowerCaseName.contains("code") || lowerCaseName.endsWith(".java") || lowerCaseName.endsWith(".js") || lowerCaseName.endsWith(".py")) {
            size = codeSize;
        } else if (lowerCaseName.contains("business") || lowerCaseName.contains("rules")) {
            size = businessRulesSize;
        }

        return DocumentSplitters.recursive(size, overlap);
    }
}


