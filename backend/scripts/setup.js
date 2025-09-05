const fs = require('fs-extra');
const path = require('path');

async function setup() {
    console.log('🚀 Setting up SEBI Chatbot...');

    // Create necessary directories
    const dirs = [
        path.join(__dirname, '..', 'pdfs'),
        path.join(__dirname, '..', 'data'),
        path.join(__dirname, '..', 'logs'),
    ];

    for (const dir of dirs) {
        await fs.ensureDir(dir);
        console.log(`✅ Created directory: ${dir}`);
    }

    // Check if .env exists
    const envPath = path.join(__dirname, '..', '.env');
    if (!await fs.pathExists(envPath)) {
        console.log('❌ .env file not found!');
        console.log('Please create a .env file with the following variables:');
        console.log('GEMINI_API_KEY=your_gemini_api_key_here');
        console.log('PORT=3000');
        console.log('CHROMA_HOST=localhost');
        console.log('CHROMA_PORT=8000');
        process.exit(1);
    }

    console.log('✅ Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Add your SEBI PDF files to the pdfs/ directory');
    console.log('2. Start ChromaDB: docker run -p 8000:8000 chromadb/chroma');
    console.log('3. Start the server: npm run dev');
}

setup().catch(console.error);
