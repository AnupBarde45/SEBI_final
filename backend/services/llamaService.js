const axios = require('axios');

class LlamaService {
    constructor() {
        this.apiUrl = process.env.LLAMA_API_URL || 'http://localhost:11434';
        this.chatModel = process.env.LLAMA_CHAT_MODEL || 'llama3';
        this.embedModel = process.env.LLAMA_EMBED_MODEL || 'nomic-embed-text';
    }

    async generateEmbedding(text) {
        try {
            const response = await axios.post(`${this.apiUrl}/api/embeddings`, {
                model: this.embedModel,
                prompt: text
            }, { timeout: 30000 });
            return response.data.embedding;
        } catch (error) {
            console.error('Error generating Llama embedding:', error.message);
            throw error;
        }
    }

    async generateBatchEmbeddings(texts) {
        const embeddings = [];
        for (let i = 0; i < texts.length; i++) {
            const embedding = await this.generateEmbedding(texts[i]);
            embeddings.push(embedding);
        }
        return embeddings;
    }

    async generateResponse(query, context) {
        try {
            const prompt = this.createRAGPrompt(query, context);
            
            const response = await axios.post(`${this.apiUrl}/api/generate`, {
                model: this.chatModel,
                prompt: prompt,
                stream: false
            }, { timeout: 60000 });
            
            return response.data.response;
        } catch (error) {
            console.error('Error generating Llama response:', error.message);
            throw error;
        }
    }

    createRAGPrompt(query, context) {
        return `You are a SEBI (Securities and Exchange Board of India) expert chatbot. You help users understand SEBI regulations, guidelines, and procedures based on official SEBI documents.

Context from SEBI documents:
${context.map((chunk, index) => `
Document ${index + 1} (Source: ${chunk.metadata?.source || 'Unknown'}):
${chunk.document}
`).join('\n')}

User Question: ${query}

Instructions:
1. Answer based primarily on the provided SEBI document context
2. If the context doesn't contain relevant information, say so clearly
3. Provide specific references to SEBI regulations or sections when possible
4. Keep answers accurate, professional, and helpful
5. If unsure about any detail, mention that the user should verify with official SEBI sources
6. Answer in the same language as the user, if he asked in Hindi, answer in Hindi, if Hinglish answer in Hinglish, slangs use slangs, etc
7. Format the answer properly with paragraphs and bullet points if needed. Don't use "*", use beautiful unicode characters like ✓, ●, ►, ▪️, 🔹, 🔸 etc

Answer:`;
    }

    async testConnection() {
        try {
            const response = await axios.post(`${this.apiUrl}/api/generate`, {
                model: this.chatModel,
                prompt: "Hello, test connection",
                stream: false
            }, { timeout: 60000 });
            return { success: true, message: "Connection successful" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = LlamaService;