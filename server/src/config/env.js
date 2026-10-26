import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });

export function loadConfig(env = process.env) {
  const required = ['MONGODB_URI', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'SESSION_SECRET'];
  const missing = required.filter((key) => !env[key]?.trim());
  if (missing.length) throw new Error(`Missing required server configuration: ${missing.join(', ')}. Copy server/.env.example to server/.env and configure it.`);
  return {
    nodeEnv: env.NODE_ENV || 'development',
    port: Number(env.PORT || 5000),
    mongoUri: env.MONGODB_URI,
    geminiApiKey: env.GEMINI_API_KEY,
    geminiModel: env.GEMINI_MODEL,
    sessionSecret: env.SESSION_SECRET,
    googleClientId: env.GOOGLE_CLIENT_ID || '',
    clientOrigin: env.CLIENT_ORIGIN || 'http://localhost:5173',
  };
}
