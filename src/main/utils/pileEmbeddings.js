const fs = require('fs');
const axios = require('axios');
const path = require('path');
const matter = require('gray-matter');
const { getKey } = require('./store');

// Todo: Cache the norms alongside embeddings at some point
// to avoid recomputing them for every query
function cosineSimilarity(embedding, queryEmbedding) {
  if (embedding?.length !== queryEmbedding?.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  embedding.forEach((value, index) => {
    dotProduct += value * queryEmbedding[index];
    normA += value ** 2;
    normB += queryEmbedding[index] ** 2;
  });

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    throw new Error('One of the vectors is zero, cannot compute similarity');
  }

  return dotProduct / (normA * normB);
}

class PileEmbeddings {
  constructor() {
    this.pilePath = null;
    this.fileName = `embeddings.json`;
    this.apiKey = null;
    this.embeddings = new Map();
  }

  async initialize(pilePath, index) {
    try {
      this.pilePath = pilePath;
      await this.initializeAPIKey();

      if (!this.apiKey) {
        console.log(
          'API key not found. Please set it first to use AI features.',
        );
        return {};
      }
      const embeddingsFilePath = path.join(pilePath, this.fileName);
      if (fs.existsSync(embeddingsFilePath)) {
        const data = fs.readFileSync(embeddingsFilePath, 'utf8');
        this.embeddings = new Map(JSON.parse(data));
      } else {
        // Embeddings need to be generated based on the index
        await this.walkAndGenerateEmbeddings(pilePath, index);
        this.saveEmbeddings();
      }
    } catch (error) {
      console.error('Failed to load embeddings:', error);
    }
    return {};
  }

  async initializeAPIKey() {
    const apiKey = await getKey();
    if (!apiKey) {
      throw new Error('API key not found. Please set it first.');
    }
    this.apiKey = apiKey;
  }

  async walkAndGenerateEmbeddings(pilePath, index) {
    console.log('🧮 Generating embeddings for index:', index.size);
    this.embeddings = new Map();
    Array.from(index.entries()).forEach(([entryPath, metadata]) => {
      this.addDocument(entryPath, metadata);
    });
  }

  saveEmbeddings() {
    try {
      const embeddingsFilePath = path.join(this.pilePath, this.fileName);
      const entries = this.embeddings.entries();
      if (!entries) return;
      const strMap = JSON.stringify(Array.from(entries));
      fs.writeFileSync(embeddingsFilePath, strMap, 'utf8');
    } catch (error) {
      console.error('Failed to save embeddings:', error);
    }
  }

  async addDocument(entryPath, metadata) {
    try {
      // we only index parent documents
      // the replies are concatenated to the contents
      if (metadata.isReply) return;

      const fullPath = path.join(this.pilePath, entryPath);
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      let { content } = matter(fileContent);
      content = `Entry on ${metadata.createdAt}\n\n${content}\n\nReplies:\n`;

      // concat the contents of replies
      metadata.replies.forEach((replyPath) => {
        const replyFullPath = path.join(this.pilePath, replyPath);
        const replyFileContent = fs.readFileSync(replyFullPath, 'utf8');
        const { content: replyContent } = matter(replyFileContent);
        content += `\n${replyContent}`;
      });

      try {
        const embedding = await this.generateEmbedding(content);
        this.embeddings.set(entryPath, embedding);
        console.log('🧮 Embeddings created for thread: ', entryPath);
      } catch (embeddingError) {
        console.warn(
          `Failed to generate embedding for thread: ${entryPath}`,
          embeddingError,
        );
        // Skip this document and continue with the next one
        return;
      }

      this.saveEmbeddings();
    } catch (error) {
      console.error('Failed to process thread for vector index.', error);
    }
  }

  async generateEmbedding(document) {
    const url = 'https://api.openai.com/v1/embeddings';
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
    const data = {
      model: 'text-embedding-3-small',
      input: document,
    };

    try {
      const response = await axios.post(url, data, { headers });
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding with OpenAI:', error);
      return null;
    }
  }

  async regenerateEmbeddings(index) {
    console.log('🧮 Regenerating embeddings for index:', index.size);
    this.embeddings.clear();
    await Array.from(index.entries()).reduce(
      (promise, [entryPath, metadata]) =>
        promise.then(() => this.addDocument(entryPath, metadata)),
      Promise.resolve(),
    );
    this.saveEmbeddings();
    console.log('✅ Embeddings regeneration complete');
  }

  async search(query, topN = 50) {
    const queryEmbedding = await this.generateEmbedding(query);

    if (!queryEmbedding) {
      console.error('Failed to generate query embedding.');
      return [];
    }

    const scores = [];
    this.embeddings.forEach((embedding, entryPath) => {
      const score = cosineSimilarity(embedding, queryEmbedding);
      scores.push({ entryPath, score });
    });

    scores.sort((a, b) => b.score - a.score);
    const topNEntries = scores.slice(0, topN).map((s) => s.entryPath);
    return topNEntries;
  }
}

module.exports = new PileEmbeddings();
