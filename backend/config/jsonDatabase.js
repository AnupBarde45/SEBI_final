const fs = require('fs-extra');
const path = require('path');

class JSONVectorDatabase {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data', 'vectors', 'chunks');
        this.metaPath = path.join(__dirname, '..', 'data', 'vectors', 'metadata.json');
        this.embeddings = [];
        this.documents = [];
        this.chunkSize = 1000; // Save in chunks of 1000
    }

    async initialize() {
        try {
            await fs.ensureDir(this.dataDir);
            
            // Load metadata
            let metadata = { totalCount: 0, chunkCount: 0 };
            if (await fs.pathExists(this.metaPath)) {
                metadata = await fs.readJson(this.metaPath);
            }
            
            // Load all chunks
            for (let i = 0; i < metadata.chunkCount; i++) {
                try {
                    const embeddingPath = path.join(this.dataDir, `embeddings_${i}.json`);
                    const documentPath = path.join(this.dataDir, `documents_${i}.json`);
                    
                    if (await fs.pathExists(embeddingPath) && await fs.pathExists(documentPath)) {
                        const embeddingChunk = await fs.readJson(embeddingPath);
                        const documentChunk = await fs.readJson(documentPath);
                        
                        if (Array.isArray(embeddingChunk) && Array.isArray(documentChunk)) {
                            this.embeddings.push(...embeddingChunk);
                            this.documents.push(...documentChunk);
                        }
                    }
                } catch (chunkError) {
                    console.warn(`Skipping corrupted chunk ${i}:`, chunkError.message);
                }
            }
            
            console.log(`Loaded ${this.embeddings.length} embeddings from ${metadata.chunkCount} chunks`);
            return true;
        } catch (error) {
            console.error('Failed to initialize JSON database:', error);
            return false;
        }
    }

    async addDocuments(documents, embeddings, metadatas, ids) {
        try {
            // Add to memory arrays
            for (let i = 0; i < documents.length; i++) {
                this.embeddings.push({
                    id: ids[i],
                    embedding: embeddings[i]
                });
                this.documents.push({
                    id: ids[i],
                    document: documents[i],
                    metadata: metadatas[i]
                });
            }
            
            // Save in chunks
            await this.saveInChunks();
            return true;
        } catch (error) {
            console.error('Error adding documents:', error);
            return false;
        }
    }

    async saveInChunks() {
        try {
            await fs.ensureDir(this.dataDir);
            
            const chunkCount = Math.ceil(this.embeddings.length / this.chunkSize);
            
            for (let i = 0; i < chunkCount; i++) {
                const start = i * this.chunkSize;
                const end = Math.min(start + this.chunkSize, this.embeddings.length);
                
                const embeddingChunk = this.embeddings.slice(start, end);
                const documentChunk = this.documents.slice(start, end);
                
                await fs.writeJson(path.join(this.dataDir, `embeddings_${i}.json`), embeddingChunk);
                await fs.writeJson(path.join(this.dataDir, `documents_${i}.json`), documentChunk);
            }
            
            // Save metadata
            await fs.writeJson(this.metaPath, {
                totalCount: this.embeddings.length,
                chunkCount: chunkCount
            });
            
            console.log(`Saved ${this.embeddings.length} embeddings in ${chunkCount} chunks`);
        } catch (error) {
            console.error('Error saving chunks:', error);
            throw error;
        }
    }

    async searchSimilar(queryEmbedding, nResults = 3) {
        try {
            const similarities = this.embeddings.map((item, index) => {
                const similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
                const doc = this.documents.find(d => d.id === item.id);
                return {
                    similarity,
                    distance: 1 - similarity,
                    document: doc?.document || '',
                    metadata: doc?.metadata || {},
                    index
                };
            });

            similarities.sort((a, b) => b.similarity - a.similarity);
            const topResults = similarities.slice(0, nResults);

            return {
                documents: [topResults.map(r => r.document)],
                metadatas: [topResults.map(r => r.metadata)],
                distances: [topResults.map(r => r.distance)]
            };
        } catch (error) {
            console.error('Error searching documents:', error);
            return null;
        }
    }

    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    async getCollectionInfo() {
        return { count: this.embeddings.length, name: 'json_embeddings' };
    }

    async getExistingIds() {
        return this.documents.map(item => item.id);
    }

    async clearAll() {
        this.embeddings = [];
        this.documents = [];
        await fs.emptyDir(this.dataDir);
        await fs.writeJson(this.metaPath, { totalCount: 0, chunkCount: 0 });
        console.log('Cleared all embeddings');
    }
}

module.exports = JSONVectorDatabase;