module.exports = {
    // Database Configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'sebi_final',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Pass@12345#'
    },

    // ChromaDB Configuration
    chroma: {
        url: process.env.CHROMA_URL || 'http://localhost:8000',
        collection: process.env.CHROMA_COLLECTION || 'sebi_documents'
    },

    // PDF Processing Configuration
    pdf: {
        folderPath: process.env.PDF_FOLDER_PATH || './data/pdfs',
        chunkSize: parseInt(process.env.CHUNK_SIZE) || 1000,
        chunkOverlap: parseInt(process.env.CHUNK_OVERLAP) || 200
    },

    // Vector Storage Configuration
    vector: {
        storagePath: process.env.VECTOR_STORAGE_PATH || './data/vectors'
    },

    // Llama API Configuration (Optional)
    llama: {
        apiUrl: process.env.LLAMA_API_URL || 'http://localhost:11434',
        model: process.env.LLAMA_MODEL || 'llama3'
    },

    // Gemini API Configuration
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || 'AIzaSyAXlVsfSS3P9E_hSsDbns0zM0Z0e3A7RyY', // Replace with your actual API key
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
    },

    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV || 'development'
    }
};

