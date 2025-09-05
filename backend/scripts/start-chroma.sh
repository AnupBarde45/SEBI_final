#!/bin/bash
# Start ChromaDB server with persistent storage
docker run -d -p 8000:8000 -v chroma-data:/chroma/chroma chromadb/chroma
