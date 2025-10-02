const { ChromaClient } = require('chromadb');
const settings = require('./settings');

class ChromaDBService {
    constructor() {
        this.client = new ChromaClient({
            path: settings.chroma.url
        });
        this.collectionName = settings.chroma.collection;
        this.collection = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('Initializing ChromaDB connection...');
            
            // Test connection
            await this.client.heartbeat();
            console.log('ChromaDB connection successful');

            // Get or create collection
            try {
                this.collection = await this.client.getCollection({
                    name: this.collectionName
                });
                console.log(`Found existing collection: ${this.collectionName}`);
            } catch (error) {
                console.log(`Creating new collection: ${this.collectionName}`);
                this.collection = await this.client.createCollection({
                    name: this.collectionName,
                    metadata: {
                        description: "SEBI documents and regulations"
                    }
                });
            }

            this.initialized = true;
            console.log('ChromaDB initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize ChromaDB:', error);
            return false;
        }
    }

    async addDocuments(documents, embeddings, metadatas, ids) {
        try {
            if (!this.initialized) {
                throw new Error('ChromaDB not initialized');
            }

            console.log(`Adding ${documents.length} documents to ChromaDB...`);
            
            await this.collection.add({
                documents: documents,
                embeddings: embeddings,
                metadatas: metadatas,
                ids: ids
            });

            console.log(`Successfully added ${documents.length} documents to ChromaDB`);
            return true;
        } catch (error) {
            console.error('Error adding documents to ChromaDB:', error);
            return false;
        }
    }

    async searchSimilar(queryEmbedding, topK = 3) {
        try {
            if (!this.initialized) {
                throw new Error('ChromaDB not initialized');
            }

            const results = await this.collection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: topK
            });

            return {
                documents: results.documents,
                metadatas: results.metadatas,
                distances: results.distances
            };
        } catch (error) {
            console.error('Error searching ChromaDB:', error);
            return null;
        }
    }

    async getCollectionInfo() {
        try {
            if (!this.initialized) {
                throw new Error('ChromaDB not initialized');
            }

            const count = await this.collection.count();
            return {
                count: count,
                name: this.collectionName
            };
        } catch (error) {
            console.error('Error getting collection info:', error);
            return null;
        }
    }

    async getExistingIds() {
        try {
            if (!this.initialized) {
                throw new Error('ChromaDB not initialized');
            }

            // Get all documents to extract IDs
            const results = await this.collection.get({
                include: ['metadatas']
            });

            return results.ids || [];
        } catch (error) {
            console.error('Error getting existing IDs:', error);
            return [];
        }
    }

    async clearCollection() {
        try {
            if (!this.initialized) {
                throw new Error('ChromaDB not initialized');
            }

            // Delete the collection and recreate it
            await this.client.deleteCollection({
                name: this.collectionName
            });

            this.collection = await this.client.createCollection({
                name: this.collectionName,
                metadata: {
                    description: "SEBI documents and regulations"
                }
            });

            console.log('Collection cleared and recreated');
            return true;
        } catch (error) {
            console.error('Error clearing collection:', error);
            return false;
        }
    }
}

module.exports = ChromaDBService;
