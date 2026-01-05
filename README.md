# 🤖 AI KT Assistant - v1.0.0

An advanced AI-powered **Knowledge Transfer (KT) Assistant** designed to bridge the gap between complex project documentation and developer understanding. This version (v1) focuses on robust **functionality**, **persistence**, and **feature coverage** to provide a production-ready experience for local development.

---

## 🌟 Version 1 Key Features

This release marks the completion of the core functionality, moving from a basic prototype to a database-driven application.

### 🧠 Advanced RAG Engine
- **Local-First Intelligence**: Integrated with **Ollama** using `phi3` (LLM) and `nomic-embed-text` (Embeddings) for 100% data privacy and zero API costs.
- **Precision Retrieval**: Configurable RAG parameters (`max-results`, `min-score`) to tune the quality of AI responses.
- **Metadata Filtering**: Smart context isolation using metadata tags to ensure the AI only answers using the selected project's documentation.

### 🗄️ Robust Persistence & Data Management
- **PostgreSQL Integration**: Transitioned from file-based storage to a relational database (**PostgreSQL**) for managing project metadata.
- **Schema Design**: Automated table management for project "Masters" including creation dates, active status, and soft-delete capabilities.
- **Persistent Vector Store**: Automatic serialization of indexed knowledge to `embeddings.json`, ensuring your training data survives application restarts.

### 🛠️ Multi-Master Architecture
- **Dynamic Domain Support**: Create, rename, and manage multiple isolated knowledge bases ("Masters") for different projects or business domains.
- **Master Lifecycle**: Full CRUD operations (Create, Read, Update, Delete) for project masters directly from the UI.
- **Active/Inactive Toggle**: Ability to deactivate project masters to clean up your workspace without deleting the underlying data.

### 🎨 Premium UI/UX Experience
- **Modern Chat Interface**: A redesigned, asymmetric chat bubble system with smooth `fadeIn` animations.
- **Real-time Streaming**: Instant token-by-token response streaming for a responsive feel.
- **Custom Design Tokens**: Slim, theme-aware scrollbars and a professional "Dark Mode" sidebar.
- **Training Ground**: A dedicated area for ingesting knowledge from **PDF, Word, Text, and Markdown** files or raw text input.

---

## 📸 Application Preview

![Chat View](./ai-chatbot-ui/public/page-1.png)
*Modern Chat Interface with streaming responses.*

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Lucide-Icons, React-Markdown, Axios |
| **Backend** | Java 17+, Spring Boot 3.3, Spring Data JPA, LangChain4j |
| **Database** | PostgreSQL (Metadata), Persistent In-Memory Vector Store |
| **Intelligence** | Ollama (Local LLM Execution) |

---

## 🏁 Getting Started

### Prerequisites
- **Java 17+** & **PostgreSQL**
- **Ollama**: [Download here](https://ollama.com/)
  ```bash
  ollama pull phi3
  ollama pull nomic-embed-text
  ```

### Quick Setup
1. **Database**: Create a database named `ai-kt-assistant-db` in your PostgreSQL instance.
2. **Backend**: Update `src/main/resources/application.properties` with your database credentials and run:
   ```bash
   mvn clean spring-boot:run
   ```
3. **Frontend**: Navigate to `ai-chatbot-ui`, install dependencies, and start:
   ```bash
   npm install && npm start
   ```

---

## 👨‍💻 Author
**Muhammad Waqar**

---
*v1.0.0 - Focused on functionality, reliability, and developer empowerment.*
