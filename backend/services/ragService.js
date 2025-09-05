const VectorDatabase = require('../config/database');
const LlamaService = require('./llamaService');

class RAGService {
    constructor() {
        this.vectorDB = new VectorDatabase();
        this.llamaService = new LlamaService();
        this.initialized = false;
    }

    async initialize() {
        try {
            const dbInitialized = await this.vectorDB.initialize();
            if (!dbInitialized) {
                throw new Error('Failed to initialize vector database');
            }

            const llamaTest = await this.llamaService.testConnection();
            if (!llamaTest.success) {
                throw new Error(`Llama API connection failed: ${llamaTest.error}`);
            }

            this.initialized = true;
            console.log('RAG Service initialized successfully');
            return true;
        } catch (error) {
            console.error('RAG Service initialization failed:', error);
            return false;
        }
    }

    async addDocumentsToVectorDB(chunks) {
        try {
            if (!this.initialized) {
                throw new Error('RAG Service not initialized');
            }

            // Check which chunks are already in the database
            const existingIds = await this.vectorDB.getExistingIds();
            const newChunks = chunks.filter(chunk => !existingIds.includes(chunk.id));
            
            if (newChunks.length === 0) {
                console.log('All chunks already exist in vector database. Skipping embedding generation.');
                return true;
            }

            console.log(`Found ${existingIds.length} existing embeddings. Processing ${newChunks.length} new chunks...`);
            
            // Process in batches to allow resuming
            const batchSize = 500;
            let processedCount = 0;
            
            for (let i = 0; i < newChunks.length; i += batchSize) {
                const batch = newChunks.slice(i, i + batchSize);
                console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newChunks.length/batchSize)} (${batch.length} chunks)...`);
                
                const texts = batch.map(chunk => chunk.text);
                const embeddings = await this.llamaService.generateBatchEmbeddings(texts);
                
                const documents = batch.map(chunk => chunk.text);
                const metadatas = batch.map(chunk => chunk.metadata);
                const ids = batch.map(chunk => chunk.id);
                
                const success = await this.vectorDB.addDocuments(documents, embeddings, metadatas, ids);
                
                if (success) {
                    processedCount += batch.length;
                    console.log(`✅ Batch completed. Progress: ${existingIds.length + processedCount}/${chunks.length} total chunks`);
                } else {
                    throw new Error(`Failed to add batch ${Math.floor(i/batchSize) + 1} to vector database`);
                }
            }
            
            console.log(`Successfully added ${processedCount} new documents to vector database`);
            return true;
            
        } catch (error) {
            console.error('Error adding documents to vector DB:', error);
            throw error;
        }
    }

    async queryDocuments(question, topK = 3) {
        try {
            if (!this.initialized) {
                throw new Error('RAG Service not initialized');
            }

            // Generate embedding for the question
            console.log('Generating embedding for question...');
            const questionEmbedding = await this.llamaService.generateEmbedding(question);

            // Search for similar documents
            console.log('Searching for relevant documents...');
            const searchResults = await this.vectorDB.searchSimilar(questionEmbedding, topK);

            if (!searchResults || !searchResults.documents || searchResults.documents[0].length === 0) {
                return {
                    answer: "I couldn't find relevant information in the SEBI documents to answer your question. Please try rephrasing your question or asking about specific SEBI regulations.",
                    sources: [],
                    confidence: 0
                };
            }

            // Prepare context for Llama
            const context = searchResults.documents[0].map((doc, index) => ({
                document: doc,
                metadata: searchResults.metadatas[0][index],
                distance: searchResults.distances[0][index]
            }));

            // Generate response using Llama with context
            console.log('Generating response with Llama...');
            const answer = await this.llamaService.generateResponse(question, context);

            return {
                answer,
                sources: context.map(c => ({
                    source: c.metadata?.source || 'Unknown',
                    chunk_index: c.metadata?.chunk_index || 0,
                    confidence: 1 - c.distance // Convert distance to confidence
                })),
                confidence: Math.max(0, 1 - Math.min(...searchResults.distances[0]))
            };

        } catch (error) {
            console.error('Error querying documents:', error);
            return {
                answer: "I encountered an error while processing your question. Please try again.",
                sources: [],
                confidence: 0,
                error: error.message
            };
        }
    }

    async getCollectionInfo() {
        try {
            return await this.vectorDB.getCollectionInfo();
        } catch (error) {
            console.error('Error getting collection info:', error);
            return null;
        }
    }

    async getExistingIds() {
        try {
            return await this.vectorDB.getExistingIds();
        } catch (error) {
            console.error('Error getting existing IDs:', error);
            return [];
        }
    }
}

module.exports = RAGService;
