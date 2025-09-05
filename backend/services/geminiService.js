const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        this.embeddingModel = this.genAI.getGenerativeModel({ model: "embedding-001" });
    }

    async generateEmbedding(text) {
        try {
            const result = await this.embeddingModel.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }

    async generateEmbeddings(texts) {
        try {
            const embeddings = [];
            console.log(`Generating embeddings for ${texts.length} chunks...`);

            for (let i = 0; i < texts.length; i++) {
                const embedding = await this.generateEmbedding(texts[i]);
                embeddings.push(embedding);
                
                if ((i + 1) % 10 === 0) {
                    console.log(`Generated ${i + 1}/${texts.length} embeddings`);
                }

                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return embeddings;
        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw error;
        }
    }

    async generateResponse(query, context) {
        try {
            const prompt = this.createRAGPrompt(query, context);
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating response:', error);
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
6. Answer in the same language as the user, if he asked in Hindi, answer in Hindi, if Hinglish aswer in Hinglish, slangs use slangs, etc
7. Format the answer properly with paragraphs and bullet points if needed. Don't use "*", use beautiful unicode characters like ✓, ●, ►, ▪️, 🔹, 🔸 etc
Answer:`;
    }

    async testConnection() {
        try {
            const result = await this.model.generateContent("Hello, test connection");
            return { success: true, message: "Connection successful" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = GeminiService;
