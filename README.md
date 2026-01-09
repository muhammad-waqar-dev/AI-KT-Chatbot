# 🤖 AI KT Assistant - v0.2.0 (Production Scaling)

An advanced AI-powered **Knowledge Transfer (KT) Assistant** designed to bridge the gap between complex project documentation and developer understanding. 

---

## 🌟 Version 0.2 Highlights (Scaling & Persistence)

This version focuses on moving from a local prototype to a production-ready architecture by externalizing storage and intelligence.

### 🚀 Production-Grade Storage
- **Vector Database (Qdrant Cloud)**: Transitioned from in-memory storage to **Qdrant Cloud**. This enables massive scalability, faster retrieval, and persistent vector storage.
- **Cloud Document Storage (AWS S3)**: Documentation files are no longer stored on your local machine. They are now uploaded to **AWS S3**, with URLs and metadata stored in the vector database.
- **Relational Database (PostgreSQL)**: 
    - **Master Management**: Persistent storage for project metadata.
    - **Chat Audit Logging**: Every user prompt and AI response is now logged for quality monitoring and auditing.

### 🧩 Intelligent Chunking
- **Dynamic Splitter**: Implemented a specialized chunking utility that adjusts its strategy based on the content type:
    - **KT Docs**: 800 tokens (Standard documentation).
    - **Source Code**: 500 tokens (Optimized for Java, JS, Python).
    - **Business Rules**: 400 tokens (Precise rules).
- **Context Overlap**: 100-token overlap to ensure continuity between chunks.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Lucide-Icons, React-Markdown, Axios |
| **Backend** | Java 17+, Spring Boot 3.3, Spring Data JPA |
| **Vector DB** | Qdrant Cloud |
| **Cloud Storage** | AWS S3 (Free Tier recommended) |
| **Database** | PostgreSQL |
| **Intelligence** | Ollama (Local) - *Upgrading in v0.3* |

---

## 🏁 Getting Started (v0.2 Setup)

### 1. Cloud Credentials
Update `ai-chatbot-service/src/main/resources/application.properties` with your credentials:

#### Qdrant Cloud
1. Create a free account at [Qdrant Cloud](https://cloud.qdrant.io/).
2. Create a cluster and get your **URL** and **API Key**.

#### AWS S3
1. Create an S3 bucket.
2. Create an IAM user with `AmazonS3FullAccess` and generate **Access Key** and **Secret Key**.

### 2. Configuration
```properties
# Qdrant
chatbot.qdrant.url=https://your-id.cloud.qdrant.io
chatbot.qdrant.api-key=your-key

# S3
chatbot.s3.bucket-name=your-bucket
chatbot.s3.access-key=your-access-key
chatbot.s3.secret-key=your-secret-key
```

### 3. Database
The system will automatically create the `chat_audit_log` table in your existing `ai-kt-assistant-db`.

---

## 👨‍💻 Author
**Muhammad Waqar**

---
*v0.2.0 - Scaling knowledge for the enterprise.*
