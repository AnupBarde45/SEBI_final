// Simple embedding service using basic text processing
class EmbeddingService {
    constructor() {
        this.initialized = false;
        this.embeddingSize = 384; // Standard embedding size
    }

    async initialize() {
        try {
            console.log('Initializing simple embedding service...');
            this.initialized = true;
            console.log('Embedding service initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize embedding service:', error);
            return false;
        }
    }

    async generateEmbedding(text) {
        try {
            if (!this.initialized) {
                throw new Error('Embedding service not initialized');
            }

            console.log(`Generating embedding for text: ${text.substring(0, 50)}...`);
            
            // Clean and prepare text
            const cleanText = text.trim().replace(/\s+/g, ' ');
            
            // Generate simple hash-based embedding
            const embedding = this.textToEmbedding(cleanText);

            console.log(`Generated embedding with ${embedding.length} dimensions`);
            return embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }

    textToEmbedding(text) {
        // Simple hash-based embedding generation
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(this.embeddingSize).fill(0);
        
        // Create a simple bag-of-words style embedding
        words.forEach(word => {
            const hash = this.simpleHash(word);
            const index = hash % this.embeddingSize;
            embedding[index] += 1;
        });
        
        // Normalize the embedding
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            for (let i = 0; i < embedding.length; i++) {
                embedding[i] = embedding[i] / magnitude;
            }
        }
        
        return embedding;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    async generateBatchEmbeddings(texts) {
        try {
            if (!this.initialized) {
                throw new Error('Embedding service not initialized');
            }

            console.log(`Generating ${texts.length} embeddings...`);
            const embeddings = [];

            // Process all texts
            for (let i = 0; i < texts.length; i++) {
                const embedding = this.textToEmbedding(texts[i]);
                embeddings.push(embedding);
                
                if ((i + 1) % 10 === 0) {
                    console.log(`Processed ${i + 1}/${texts.length} embeddings...`);
                }
            }

            console.log(`Generated ${embeddings.length}/${texts.length} embeddings`);
            return embeddings;
        } catch (error) {
            console.error('Error generating batch embeddings:', error);
            throw error;
        }
    }

    getModelInfo() {
        return {
            name: 'Simple Hash-based Embedding',
            initialized: this.initialized,
            dimensions: this.embeddingSize
        };
    }
}

module.exports = EmbeddingService;
