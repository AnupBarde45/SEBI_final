const PDFFolderWatcher = require('./pdfFolderWatcher');
const RAGService = require('./ragService');
const settings = require('../config/settings');

class RAGManager {
    constructor() {
        this.pdfFolderPath = settings.pdf.folderPath;
        this.pdfWatcher = new PDFFolderWatcher(this.pdfFolderPath);
        this.ragService = new RAGService();
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('Initializing RAG Manager...');
            
            // Initialize RAG service
            const ragInitialized = await this.ragService.initialize();
            if (!ragInitialized) {
                throw new Error('Failed to initialize RAG service');
            }

            // Initialize PDF folder watcher
            const watcherInitialized = await this.pdfWatcher.initialize();
            if (!watcherInitialized) {
                throw new Error('Failed to initialize PDF folder watcher');
            }

            this.initialized = true;
            console.log('RAG Manager initialized successfully');
            return true;
        } catch (error) {
            console.error('RAG Manager initialization failed:', error);
            return false;
        }
    }

    async startWatching() {
        try {
            if (!this.initialized) {
                throw new Error('RAG Manager not initialized');
            }

            // Process any existing PDFs first
            console.log('Processing existing PDFs...');
            await this.pdfWatcher.processAllExistingPDFs();

            // Start watching for new PDFs
            const watching = this.pdfWatcher.startWatching();
            if (watching) {
                console.log('PDF folder watcher started successfully');
                return true;
            } else {
                throw new Error('Failed to start PDF folder watcher');
            }
        } catch (error) {
            console.error('Error starting PDF watching:', error);
            return false;
        }
    }

    async stopWatching() {
        try {
            this.pdfWatcher.stopWatching();
            console.log('PDF folder watcher stopped');
            return true;
        } catch (error) {
            console.error('Error stopping PDF watching:', error);
            return false;
        }
    }

    async queryDocuments(question, topK = 3) {
        try {
            if (!this.initialized) {
                throw new Error('RAG Manager not initialized');
            }

            return await this.ragService.queryDocuments(question, topK);
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

    async getStatus() {
        try {
            const watcherStatus = await this.pdfWatcher.getStatus();
            const collectionInfo = await this.ragService.getCollectionInfo();
            
            return {
                initialized: this.initialized,
                pdfFolder: this.pdfFolderPath,
                watcher: watcherStatus,
                collection: collectionInfo
            };
        } catch (error) {
            console.error('Error getting status:', error);
            return null;
        }
    }

    async addDocumentsToVectorDB(chunks) {
        try {
            if (!this.initialized) {
                throw new Error('RAG Manager not initialized');
            }

            return await this.ragService.addDocumentsToVectorDB(chunks);
        } catch (error) {
            console.error('Error adding documents to vector DB:', error);
            throw error;
        }
    }

    async getCollectionInfo() {
        try {
            return await this.ragService.getCollectionInfo();
        } catch (error) {
            console.error('Error getting collection info:', error);
            return null;
        }
    }
}

module.exports = RAGManager;
