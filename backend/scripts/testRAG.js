const RAGManager = require('../services/ragManager');

async function testRAGSystem() {
    console.log('🧪 Testing RAG System...');
    console.log('========================');

    const ragManager = new RAGManager();

    try {
        // Initialize the RAG system
        console.log('📚 Initializing RAG system...');
        const initialized = await ragManager.initialize();
        
        if (!initialized) {
            console.error('❌ Failed to initialize RAG system');
            return;
        }

        console.log('✅ RAG system initialized successfully');

        // Get status
        console.log('\n📊 System Status:');
        const status = await ragManager.getStatus();
        console.log(JSON.stringify(status, null, 2));

        // Test query (if there are documents)
        if (status.collection && status.collection.count > 0) {
            console.log('\n🔍 Testing query...');
            const testQuery = "What are the main regulations?";
            console.log(`Query: "${testQuery}"`);
            
            const result = await ragManager.queryDocuments(testQuery);
            console.log('\n📝 Query Result:');
            console.log(`Answer: ${result.answer}`);
            console.log(`Confidence: ${result.confidence}`);
            console.log(`Sources: ${result.sources.length}`);
        } else {
            console.log('\n📁 No documents found in collection. Add some PDFs to the data/pdfs folder to test queries.');
        }

        console.log('\n✅ RAG System test completed successfully!');

    } catch (error) {
        console.error('❌ Error testing RAG system:', error);
    }
}

// Run the test
testRAGSystem();
