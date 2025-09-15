const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const PDFProcessor = require('./pdfProcessor');
const EmbeddingService = require('./embeddingService');
const ChromaDBService = require('../config/chromaDB');
const settings = require('../config/settings');

class PDFFolderWatcher {
    constructor(pdfFolderPath) {
        this.pdfFolderPath = pdfFolderPath || settings.pdf.folderPath;
        this.watcher = null;
        this.pdfProcessor = new PDFProcessor();
        this.embeddingService = new EmbeddingService();
        this.chromaDB = new ChromaDBService();
        this.isProcessing = false;
        this.processingQueue = [];
    }

    async initialize() {
        try {
            console.log('Initializing PDF Folder Watcher...');
            
            // Ensure PDF folder exists
            await fs.ensureDir(this.pdfFolderPath);
            console.log(`PDF folder: ${this.pdfFolderPath}`);

            // Initialize services
            const embeddingInit = await this.embeddingService.initialize();
            if (!embeddingInit) {
                throw new Error('Failed to initialize embedding service');
            }

            const chromaInit = await this.chromaDB.initialize();
            if (!chromaInit) {
                throw new Error('Failed to initialize ChromaDB');
            }

            console.log('PDF Folder Watcher initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize PDF Folder Watcher:', error);
            return false;
        }
    }

    startWatching() {
        try {
            console.log(`Starting to watch PDF folder: ${this.pdfFolderPath}`);
            
            this.watcher = chokidar.watch(path.join(this.pdfFolderPath, '*.pdf'), {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true,
                ignoreInitial: false // Process existing files on startup
            });

            this.watcher
                .on('add', (filePath) => this.handleNewPDF(filePath))
                .on('change', (filePath) => this.handleNewPDF(filePath))
                .on('error', (error) => console.error('Watcher error:', error));

            console.log('PDF folder watcher started');
            return true;
        } catch (error) {
            console.error('Failed to start PDF folder watcher:', error);
            return false;
        }
    }

    stopWatching() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            console.log('PDF folder watcher stopped');
        }
    }

    async handleNewPDF(filePath) {
        try {
            console.log(`New PDF detected: ${filePath}`);
            
            // Add to processing queue
            this.processingQueue.push(filePath);
            
            // Process if not already processing
            if (!this.isProcessing) {
                await this.processQueue();
            }
        } catch (error) {
            console.error('Error handling new PDF:', error);
        }
    }

    async processQueue() {
        if (this.isProcessing || this.processingQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        console.log(`Processing ${this.processingQueue.length} PDFs in queue...`);

        while (this.processingQueue.length > 0) {
            const filePath = this.processingQueue.shift();
            await this.processPDF(filePath);
        }

        this.isProcessing = false;
        console.log('PDF processing queue completed');
    }

    async processPDF(filePath) {
        try {
            const filename = path.basename(filePath);
            console.log(`Processing PDF: ${filename}`);

            // Check if file exists and is readable
            if (!await fs.pathExists(filePath)) {
                console.log(`File not found: ${filePath}`);
                return;
            }

            // Extract text from PDF
            const extracted = await this.pdfProcessor.extractTextFromPDF(filePath);
            console.log(`Extracted ${extracted.text.length} characters from ${filename}`);

            // Split into chunks
            const chunks = this.pdfProcessor.splitTextIntoChunks(extracted.text, extracted.filename);
            console.log(`Created ${chunks.length} chunks from ${filename}`);

            if (chunks.length === 0) {
                console.log(`No text chunks created from ${filename}, skipping...`);
                return;
            }

            // Check which chunks are already in the database
            const existingIds = await this.chromaDB.getExistingIds();
            const newChunks = chunks.filter(chunk => !existingIds.includes(chunk.id));
            
            if (newChunks.length === 0) {
                console.log(`All chunks from ${filename} already exist in database, skipping...`);
                return;
            }

            console.log(`Processing ${newChunks.length} new chunks from ${filename}...`);

            // Generate embeddings for new chunks
            const texts = newChunks.map(chunk => chunk.text);
            const embeddings = await this.embeddingService.generateBatchEmbeddings(texts);

            // Prepare data for ChromaDB
            const documents = newChunks.map(chunk => chunk.text);
            const metadatas = newChunks.map(chunk => chunk.metadata);
            const ids = newChunks.map(chunk => chunk.id);

            // Add to ChromaDB
            const success = await this.chromaDB.addDocuments(documents, embeddings, metadatas, ids);
            
            if (success) {
                console.log(`✅ Successfully processed ${filename} - added ${newChunks.length} chunks to ChromaDB`);
            } else {
                console.error(`❌ Failed to add chunks from ${filename} to ChromaDB`);
            }

        } catch (error) {
            console.error(`Error processing PDF ${filePath}:`, error);
        }
    }

    async processAllExistingPDFs() {
        try {
            console.log('Processing all existing PDFs in folder...');
            
            const pdfFiles = await fs.readdir(this.pdfFolderPath);
            const pdfPaths = pdfFiles
                .filter(file => file.toLowerCase().endsWith('.pdf'))
                .map(file => path.join(this.pdfFolderPath, file));

            console.log(`Found ${pdfPaths.length} existing PDF files`);

            for (const pdfPath of pdfPaths) {
                await this.processPDF(pdfPath);
            }

            console.log('Finished processing all existing PDFs');
        } catch (error) {
            console.error('Error processing existing PDFs:', error);
        }
    }

    async getStatus() {
        try {
            const collectionInfo = await this.chromaDB.getCollectionInfo();
            const modelInfo = this.embeddingService.getModelInfo();
            
            return {
                watching: this.watcher !== null,
                processing: this.isProcessing,
                queueLength: this.processingQueue.length,
                collectionInfo,
                modelInfo,
                pdfFolder: this.pdfFolderPath
            };
        } catch (error) {
            console.error('Error getting status:', error);
            return null;
        }
    }
}

module.exports = PDFFolderWatcher;
