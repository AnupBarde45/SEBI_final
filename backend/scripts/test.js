const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
    console.log('🧪 Running SEBI Chatbot Tests...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log(`✅ Health Status: ${healthResponse.data.status}`);
        console.log(`✅ Initialized: ${healthResponse.data.initialized}\n`);

        if (!healthResponse.data.initialized) {
            console.log('❌ Server not yet initialized. Please wait and try again.');
            return;
        }

        // Test 2: Collection info
        console.log('2. Testing collection info...');
        const collectionResponse = await axios.get(`${BASE_URL}/api/collection-info`);
        console.log(`✅ Collection: ${collectionResponse.data.name}`);
        console.log(`✅ Document count: ${collectionResponse.data.count}\n`);

        // Test 3: Sample queries
        const testQueries = [
            "What is SEBI?",
            "What are the regulations for mutual funds?",
            "How do I register as an investment advisor?",
            "What are the disclosure requirements for listed companies?"
        ];

        console.log('3. Testing chat functionality...');
        for (let i = 0; i < testQueries.length; i++) {
            const query = testQueries[i];
            console.log(`\nQuery ${i + 1}: ${query}`);
            
            const startTime = Date.now();
            const chatResponse = await axios.post(`${BASE_URL}/api/chat`, {
                message: query,
                topK: 3
            });
            const endTime = Date.now();

            console.log(`✅ Response time: ${endTime - startTime}ms`);
            console.log(`✅ Confidence: ${(chatResponse.data.confidence * 100).toFixed(1)}%`);
            console.log(`✅ Sources: ${chatResponse.data.sources.length}`);
            console.log(`✅ Answer length: ${chatResponse.data.answer.length} characters`);
        }

        console.log('\n🎉 All tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

runTests();
