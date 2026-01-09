# AI Knowledge Transfer (KT) Assistant

## Project Overview
The **AI Knowledge Transfer (KT) Assistant** is a professional-grade, Retrieval-Augmented Generation (RAG) based ecosystem designed to streamline knowledge sharing within software development teams. By leveraging advanced Large Language Models (LLMs) and Vector Databases, the system allows users to "train" custom AI Masters on project-specific documentation (PDFs, Word docs, text) and interact with them via an intuitive chat interface.

**Author:** Muhammad Waqar

---

## 📱 App Interface Gallery

| Dashboard Overview | AI Training Ground |
|:---:|:---:|
| ![Main Dashboard](public/page-1.png) | ![Training Ground](public/page-2.png) |
| *Intuitive chat interface with multi-master support* | *Seamless document ingestion & brain updates* |

| Master Management | System Insights |
|:---:|:---:|
| ![Master Creation](public/page-3.png) | ![Analytics](public/page-4.png) |
| *Create & customize project personas* | *Deep dive into knowledge metrics* |

---

## 🏗 System Architecture

The application follows a modern micro-infrastructure pattern:
- **Frontend:** React 18 with Lucide icons and Markdown support.
- **Backend:** Java 17 / Spring Boot 3.2.0 powered by LangChain4j.
- **LLM Engine:** Ollama (Local Inference).
- **Vector Database:** Qdrant (High-performance vector search).
- **Object Storage:** MinIO (S3-compatible document versioning).
- **Relational Database:** PostgreSQL (Metadata, Audit Logs, Master Management).

---

## ⚙️ Core Components & Configuration

### 1. Ollama (LLM & Embeddings)
Serves as the local intelligence engine for chat and text vectorization.
- **Endpoint:** `http://127.0.0.1:11434`
- **Models:**
    - **Chat:** `phi3` (Microsoft’s high-performance small language model).
    - **Embeddings:** `granite-embedding` (IBM’s specialized embedding model).
- **Configuration:** Ensure Ollama is running and models are pulled.

### 2. Qdrant (Vector Database)
Stores document embeddings for semantic retrieval.
- **REST API Port:** `6333`
- **gRPC Port:** `6334`
- **Collection Name:** `ai_kt_knowledge_v1_384_local_collection`
- **Dimension:** Optimized for 384-dimensional vectors (All-MiniLM-L6-v2).

### 3. MinIO (Object Storage)
Handles document versioning and storage for uploaded training materials.
- **Console/API Port:** `9090` (Configured endpoint)
- **Bucket Name:** `ai-kt-docs-versioning-bucket`
- **Access Credentials:** `minioadmin` / `minioadmin`
- **Region:** `us-east-1`

### 4. PostgreSQL (Metadata Storage)
Stores "Master" definitions, document metadata, and chat audit logs.
- **Port:** `5432`
- **Database Name:** `ai-kt-assistant-db`
- **Credentials:** `postgres` / `123`
- **Dialect:** `org.hibernate.dialect.PostgreSQLDialect`

### 5. Spring Boot (Backend Service)
The orchestration layer connecting the UI, AI models, and storage.
- **Server Port:** `8080`
- **API Base:** `/api`
- **Key Endpoints:**
    - `GET /api/masters`: Fetch all AI Masters.
    - `POST /api/chat`: Streamed chat responses (SSE).
    - `POST /api/ingest`: Upload and index documentation.
    - `DELETE /api/masters/{name}`: Remove an AI Master and its knowledge.

### 6. React (Frontend UI)
A sleek, dark-themed dashboard for managing knowledge and chatting.
- **Development Port:** `3000`
- **Styles:** Professional dark-mode CSS with fixed sidebar and internal scroll optimizations.

---

---

## 🚀 Installation & Setup Guide

### 🧱 Prerequisites
- **Java 17+** (Amazon Corretto or OpenJDK)
- **Node.js 18+** & npm
- **Maven 3.8+**
- **Docker** (Optional, for simplified infrastructure)

### Phase 1: Infrastructure Setup
1. **Ollama (AI Engine):**
   - Install Ollama from [ollama.com](https://ollama.com).
   - Pull the required models:
     ```bash
     ollama pull phi3
     ollama pull granite-embedding
     ```

2. **Qdrant (Vector DB):**
   - Recommended via Docker:
     ```bash
     docker run -p 6333:6333 qdrant/qdrant
     ```

3. **MinIO (Object Storage):**
   - Start MinIO and access the console at `http://localhost:9001`.
   - Create a bucket: `ai-kt-docs-versioning-bucket`.

4. **PostgreSQL (Database):**
   - Create a database: `ai-kt-assistant-db`.
   - Default credentials: `postgres` / `123`.

### Phase 2: Backend Deployment
1. Navigate to the service directory:
   ```bash
   cd ai-chatbot-service
   ```
2. Configure `src/main/resources/application.properties` with your environment details.
3. Launch the service:
   ```bash
   mvn spring-boot:run
   ```

### Phase 3: Frontend Deployment
1. Navigate to the UI directory:
   ```bash
   cd ai-chatbot-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm start
   ```

---

## 🛠 Advanced Configuration & Tuning

### Dynamic Chunking Strategies
The system employs content-aware chunking to maintain semantic integrity:
- **KT Docs:** 400 chars (Higher coherence for prose)
- **Code:** 300 chars (Better granularity for logic blocks)
- **Overlap:** 50 chars (Prevents "context shearing" at boundaries)

### Vector Search Optimization
- `chatbot.rag.max-results=2`: Balances context depth with LLM token limits.
- `chatbot.rag.min-score=0.5`: Filters out low-relevance noise for cleaner answers.

---

## ✨ Features at a Glance
- **⚡ Real-time RAG:** Instant knowledge retrieval from your own docs.
- **🛡 Enterprise Security:** Audit logs for every chat interaction.
- **🔄 Document Versioning:** Seamlessly update knowledge as projects evolve.
- **🎨 Modern UX:** Dark-themed, responsive dashboard with zero-scroll sidebar.
- **🧩 Extensible Architecture:** Plug-and-play models via Ollama.

---
© 2026 **Muhammad Waqar**. All rights reserved.
