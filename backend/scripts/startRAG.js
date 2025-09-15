const RAGManager = require('../services/ragManager');
const path = require('path');

async function startRAGSystem() {
    console.log('🚀 Starting SEBI RAG System...');
    console.log('=====================================');

    const ragManager = new RAGManager();

    try {
        // Initialize the RAG system
        console.log('📚 Initializing RAG system...');
        const initialized = await ragManager.initialize();
        
        if (!initialized) {
            console.error('❌ Failed to initialize RAG system');
            process.exit(1);
        }

        console.log('✅ RAG system initialized successfully');

        // Start watching for PDFs
        console.log('👀 Starting PDF folder watcher...');
        const watching = await ragManager.startWatching();
        
        if (!watching) {
            console.error('❌ Failed to start PDF folder watcher');
            process.exit(1);
        }

        console.log('✅ PDF folder watcher started');
        console.log(`📁 Watching folder: ${ragManager.pdfFolderPath}`);
        console.log('');
        console.log('🎯 RAG System is now running!');
        console.log('   - Drop PDF files into the PDF folder to process them');
        console.log('   - The system will automatically generate embeddings and store them in ChromaDB');
        console.log('   - Use the /api/chat endpoint to query the documents');
        console.log('');
        console.log('Press Ctrl+C to stop the system');

        // Keep the process running
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down RAG system...');
            await ragManager.stopWatching();
            console.log('✅ RAG system stopped');
            process.exit(0);
        });

        // Show status every 30 seconds
        setInterval(async () => {
            const status = await ragManager.getStatus();
            if (status) {
                console.log(`📊 Status: ${status.collection?.count || 0} documents in collection, ${status.watcher?.queueLength || 0} files in processing queue`);
            }
        }, 30000);

    } catch (error) {
        console.error('❌ Error starting RAG system:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the system
startRAGSystem();
