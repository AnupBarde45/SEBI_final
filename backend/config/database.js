const JSONVectorDatabase = require('./jsonDatabase');

class VectorDatabase {
    constructor() {
        this.db = new JSONVectorDatabase();
    }

    async initialize() {
        return await this.db.initialize();
    }

    async addDocuments(documents, embeddings, metadatas, ids) {
        return await this.db.addDocuments(documents, embeddings, metadatas, ids);
    }

    async searchSimilar(queryEmbedding, nResults = 3) {
        return await this.db.searchSimilar(queryEmbedding, nResults);
    }

    async getCollectionInfo() {
        return await this.db.getCollectionInfo();
    }

    async getExistingIds() {
        return await this.db.getExistingIds();
    }
}
module.exports = VectorDatabase;