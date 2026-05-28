import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 8080,
  host: process.env.HOST || '0.0.0.0',

  db: {
    path: process.env.DB_PATH || path.resolve(__dirname, '..', 'data', 'news.db'),
  },

  tavily: {
    apiKey: process.env.TAVILY_API_KEY || '',
  },

  llm: {
    apiKey: process.env.LLM_API_KEY || '',
    baseUrl: process.env.LLM_BASE_URL || 'https://iruidong.com/v1',
    model: process.env.LLM_MODEL || 'glm-5',
    embeddingModel: process.env.LLM_EMBEDDING_MODEL || '',
  },

  admin: {
    token: process.env.ADMIN_TOKEN || '',
  },

  crawl: {
    intervalHours: parseInt(process.env.CRAWL_INTERVAL_HOURS, 10) || 6,
    query: process.env.CRAWL_QUERY || '软通动力',
  },
};

export default config;
