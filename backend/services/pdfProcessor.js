const fs = require('fs-extra');
const path = require('path');
const pdfParse = require('pdf-parse');
const crypto = require('crypto');


class PDFProcessor {
    constructor() {
        this.chunkSize = parseInt(process.env.CHUNK_SIZE) || 1000;
        this.chunkOverlap = parseInt(process.env.CHUNK_OVERLAP) || 200;
    }
    generateConsistentId(text, filename, chunkIndex) {
    const content = `${filename}-${chunkIndex}-${text.substring(0, 100)}`;
    return crypto.createHash('md5').update(content).digest('hex');
    }


    async extractTextFromPDF(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(dataBuffer);
            return {
                text: data.text,
                pages: data.numpages,
                filename: path.basename(pdfPath)
            };
        } catch (error) {
            console.error(`Error extracting text from ${pdfPath}:`, error);
            throw error;
        }
    }

    splitTextIntoChunks(text, filename) {
        const chunks = [];
        const words = text.split(/\s+/);
        let currentChunk = '';
        let currentWordCount = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordCount = word.length;

            if (currentWordCount + wordCount > this.chunkSize && currentChunk.length > 0) {
                // Save current chunk
                chunks.push({
                    id: this.generateConsistentId(currentChunk.trim(), filename, chunks.length),
                    text: currentChunk.trim(),
                    metadata: {
                        source: filename,
                        chunk_index: chunks.length,
                        word_count: currentWordCount
                    }
                });

                // Start new chunk with overlap
                const overlapWords = currentChunk.split(/\s+/).slice(-this.chunkOverlap);
                currentChunk = overlapWords.join(' ') + ' ' + word;
                currentWordCount = overlapWords.join(' ').length + wordCount;
            } else {
                currentChunk += (currentChunk ? ' ' : '') + word;
                currentWordCount += wordCount;
            }
        }

        // Add the last chunk
        if (currentChunk.trim().length > 0) {
            chunks.push({
                id: this.generateConsistentId(currentChunk.trim(), filename, chunks.length),
                text: currentChunk.trim(),
                metadata: {
                    source: filename,
                    chunk_index: chunks.length,
                    word_count: currentWordCount
                }
            });
        }

        return chunks;
    }

    async processAllPDFs(pdfsDirectory) {
        try {
            const pdfFiles = fs.readdirSync(pdfsDirectory)
                .filter(file => file.toLowerCase().endsWith('.pdf'));

            console.log(`Found ${pdfFiles.length} PDF files to process`);

            let allChunks = [];

            for (const pdfFile of pdfFiles) {
                const pdfPath = path.join(pdfsDirectory, pdfFile);
                console.log(`Processing: ${pdfFile}`);

                const extracted = await this.extractTextFromPDF(pdfPath);
                const chunks = this.splitTextIntoChunks(extracted.text, extracted.filename);

                console.log(`Created ${chunks.length} chunks from ${pdfFile}`);
                allChunks = allChunks.concat(chunks);
            }

            return allChunks;
        } catch (error) {
            console.error('Error processing PDFs:', error);
            throw error;
        }
    }

    async saveProcessedData(chunks, outputPath) {
        try {
            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeJson(outputPath, chunks, { spaces: 2 });
            console.log(`Saved ${chunks.length} chunks to ${outputPath}`);
        } catch (error) {
            console.error('Error saving processed data:', error);
            throw error;
        }
    }

    async loadProcessedData(filePath) {
        try {
            if (await fs.pathExists(filePath)) {
                return await fs.readJson(filePath);
            }
            return null;
        } catch (error) {
            console.error('Error loading processed data:', error);
            return null;
        }
    }
}

module.exports = PDFProcessor;
