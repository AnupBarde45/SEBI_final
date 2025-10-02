# SEBI RAG System

This is a Retrieval-Augmented Generation (RAG) system that processes PDF documents and provides intelligent responses based on their content.

## Features

- **PDF Processing**: Automatically processes PDF files from a watched folder
- **Vector Database**: Uses ChromaDB for storing document embeddings
- **Embedding Model**: Uses all-MiniLM-L6-v2 for generating text embeddings
- **Real-time Processing**: Watches for new PDF files and processes them automatically
- **RAG Integration**: Combines document retrieval with language model generation

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start ChromaDB Server

You need to have ChromaDB running. You can either:

**Option A: Use Docker (Recommended)**
```bash
docker run -p 8000:8000 chromadb/chroma
```

**Option B: Install ChromaDB locally**
```bash
pip install chromadb
chroma run --host localhost --port 8000
```

### 3. Start the RAG System

```bash
# Start the RAG system
npm run rag

# Or for development with auto-restart
npm run rag:dev
```

## Usage

### Adding PDFs

1. Place your PDF files in the `data/pdfs` folder
2. The system will automatically detect and process them
3. Documents are chunked and embedded into ChromaDB

### Querying Documents

Use the `/api/chat` endpoint to query the documents:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the SEBI regulations for mutual funds?"}'
```

## Configuration

The system can be configured through environment variables or by modifying `config/settings.js`:

- `CHROMA_URL`: ChromaDB server URL (default: http://localhost:8000)
- `CHROMA_COLLECTION`: Collection name (default: sebi_documents)
- `PDF_FOLDER_PATH`: Path to watch for PDFs (default: ./data/pdfs)
- `CHUNK_SIZE`: Text chunk size for processing (default: 1000)
- `CHUNK_OVERLAP`: Overlap between chunks (default: 200)

## Architecture

```
PDF Files → PDF Processor → Text Chunks → Embedding Service → ChromaDB
                                                                    ↓
User Query → Embedding Service → ChromaDB Search → RAG Service → Response
```

## Components

- **PDFFolderWatcher**: Monitors PDF folder and processes new files
- **PDFProcessor**: Extracts text and creates chunks from PDFs
- **EmbeddingService**: Generates embeddings using all-MiniLM-L6-v2
- **ChromaDBService**: Manages vector database operations
- **RAGService**: Combines retrieval and generation
- **RAGManager**: Orchestrates all components

## Status Monitoring

The system provides status information including:
- Number of documents in collection
- Processing queue length
- Watcher status
- Model information

## Troubleshooting

1. **ChromaDB Connection Issues**: Ensure ChromaDB server is running on the correct port
2. **PDF Processing Errors**: Check file permissions and PDF file integrity
3. **Memory Issues**: Reduce batch size in embedding generation
4. **Model Loading Issues**: Ensure internet connection for first-time model download

## Development

To modify the system:

1. Update configuration in `config/settings.js`
2. Modify services in `services/` directory
3. Test changes with `npm run rag:dev`
4. Check logs for debugging information




