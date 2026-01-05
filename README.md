# AI KT Assistant

An advanced AI-powered Knowledge Transfer assistant designed to help developers onboard faster by answering questions based on project-specific documentation using RAG (Retrieval-Augmented Generation).

## Key Features
- **Multi-Master Support**: Create separate knowledge bases (Masters) for different projects or domains.
- **Advanced RAG**: Uses vector embeddings and metadata filtering to retrieve the most relevant context for each query.
- **Persistent Storage**: Automatically saves indexed knowledge and master lists to local storage (`embeddings.json` and `masters.txt`), ensuring data survives restarts.
- **Local AI (Ollama)**: Integrated with Ollama for privacy and cost-efficiency (supports models like `phi3` and `nomic-embed-text`).
- **Rich Document Support**: Ingest knowledge from Text, PDF, and Word documents (.docx/.doc).
- **Streaming UI**: Modern React interface with real-time token streaming and Markdown support.

## Tech Stack
- **Frontend**: React, Axios, Lucide-React, React-Markdown
- **Backend**: Java (Spring Boot 3), LangChain4j
- **AI Integration**: Ollama (via LangChain4j)
- **Vector DB**: Persistent In-Memory Store with file-based serialization

## Prerequisites
- **Java 17+**
- **Node.js & npm**
- **Ollama**: Installed and running locally.
  - Pull required models:
    ```bash
    ollama pull phi3
    ollama pull nomic-embed-text
    ```

## Getting Started

### Backend Setup
1. Navigate to `ai-chatbot-service`.
2. Configure settings in `src/main/resources/application.properties` (optional):
   - `langchain4j.ollama.chat-model.base-url`: Your Ollama URL (default: http://127.0.0.1:11434)
   - `chatbot.rag.max-results`: Number of context chunks to retrieve (default: 5)
   - `chatbot.rag.min-score`: Similarity threshold (default: 0.5)
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to `ai-chatbot-ui`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Set the API URL in a `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```
4. Start the React app:
   ```bash
   npm start
   ```

## How to Use
1. **Create a Master**: Use the "New Master" button to create a dedicated knowledge base for a project.
2. **Train the AI**: Go to the "Training Ground" for a Master and paste text or upload files (PDF/Word/Text).
3. **Chat**: Select a Master and ask questions. The AI will answer using **only** the context provided in the indexed documents.

## Configuration Options
The backend behavior can be tuned in `application.properties`:
| Property | Description | Default |
| :--- | :--- | :--- |
| `chatbot.system-message-template` | The prompt that defines the AI's persona. | Senior Expert persona |
| `chatbot.persistence.embedding-store.path` | File path for vector database storage. | `embeddings.json` |
| `chatbot.persistence.masters.path` | File path for the list of project masters. | `masters.txt` |
| `chatbot.rag.max-results` | How many document snippets to send to the AI. | 5 |
| `chatbot.rag.min-score` | Minimum relevance score for context retrieval. | 0.5 |
