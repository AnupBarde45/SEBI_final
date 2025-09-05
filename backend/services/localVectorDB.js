const fs = require('fs-extra');
const path = require('path');

class LocalVectorDB {
    constructor() {
        this.storagePath = process.env.VECTOR_STORAGE_PATH || './data/vectors';
        this.documentsFile = path.join(this.storagePath, 'documents.json');
        this.embeddingsFile = path.join(this.storagePath, 'embeddings.json');
        this.documents = [];
        this.embeddings = [];
    }

    async initialize() {
        try {
            await fs.ensureDir(this.storagePath);
            await this.loadData();
            console.log(`Local vector DB initialized with ${this.documents.length} documents`);
            return true;
        } catch (error) {
            console.error('Failed to initialize local vector DB:', error);
            return false;
        }
    }

    async loadData() {
        try {
            if (await fs.pathExists(this.documentsFile)) {
                this.documents = await fs.readJson(this.documentsFile);
            }
            if (await fs.pathExists(this.embeddingsFile)) {
                this.embeddings = await fs.readJson(this.embeddingsFile);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.documents = [];
            this.embeddings = [];
        }
    }

    async saveData() {
        try {
            await fs.writeJson(this.documentsFile, this.documents);
            await fs.writeJson(this.embeddingsFile, this.embeddings);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    async addDocuments(documents, embeddings, metadatas, ids) {
        try {
            for (let i = 0; i < documents.length; i++) {
                this.documents.push({
                    id: ids[i],
                    text: documents[i],
                    metadata: metadatas[i]
                });
                this.embeddings.push({
                    id: ids[i],
                    embedding: embeddings[i]
                });
            }
            await this.saveData();
            console.log(`Added ${documents.length} documents to local storage`);
            return true;
        } catch (error) {
            console.error('Error adding documents:', error);
            return false;
        }
    }

    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    async searchSimilar(queryEmbedding, nResults = 3) {
        try {
            const similarities = this.embeddings.map(item => ({
                id: item.id,
                similarity: this.cosineSimilarity(queryEmbedding, item.embedding)
            }));

            similarities.sort((a, b) => b.similarity - a.similarity);
            const topResults = similarities.slice(0, nResults);

            const results = {
                documents: [[]],
                metadatas: [[]],
                distances: [[]]
            };

            topResults.forEach(result => {
                const doc = this.documents.find(d => d.id === result.id);
                if (doc) {
                    results.documents[0].push(doc.text);
                    results.metadatas[0].push(doc.metadata);
                    results.distances[0].push(1 - result.similarity);
                }
            });

            return results;
        } catch (error) {
            console.error('Error searching documents:', error);
            return null;
        }
    }

    async getCollectionInfo() {
        return { count: this.documents.length, name: 'local_storage' };
    }
}

module.exports = LocalVectorDB;