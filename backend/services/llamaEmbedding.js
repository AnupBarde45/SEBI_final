const axios = require('axios');

class LlamaEmbeddingService {
    constructor() {
        this.apiUrl = process.env.LLAMA_API_URL || 'http://localhost:11434';
        this.model = process.env.LLAMA_MODEL || 'llama3';
    }

    async generateEmbedding(text) {
        try {
            console.log(`Generating embedding for text: ${text.substring(0, 50)}...`);
            const response = await axios.post(`${this.apiUrl}/api/embeddings`, {
                model: this.model,
                prompt: text
            }, {
                timeout: 30000
            });
            return response.data.embedding;
        } catch (error) {
            console.error('Error generating Llama embedding:', error.message);
            throw error;
        }
    }

    async generateBatchEmbeddings(texts) {
        const embeddings = [];
        console.log(`Generating ${texts.length} embeddings...`);
        for (let i = 0; i < texts.length; i++) {
            console.log(`Processing ${i + 1}/${texts.length}`);
            const embedding = await this.generateEmbedding(texts[i]);
            embeddings.push(embedding);
        }
        console.log(`Generated ${embeddings.length}/${texts.length} embeddings`);
        return embeddings;
    }
}

module.exports = LlamaEmbeddingService;