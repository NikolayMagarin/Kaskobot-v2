import dotevn from 'dotenv';
import assert from 'assert';

dotevn.config();

function getEnvValue(key: string) {
  const val = process.env[key];
  assert(val, `Please set ${key} in environment or in .env file`);
  return val;
}

interface Config {
  env: 'prod' | 'dev';
  firebaseClientEmail: string;
  firebasePrivateKey: string;
  firebaseProjectId: string;
  telegramBotToken: string;
  groqApiKey: string;
  assemblyAiApiKey: string;
}

export const config: Config = {
  env: 'dev',
  firebaseClientEmail: getEnvValue('FIREBASE_CLIENT_EMAIL'),
  firebasePrivateKey: getEnvValue('FIREBASE_PRIVATE_KEY'),
  firebaseProjectId: getEnvValue('FIREBASE_PROJECT_ID'),
  telegramBotToken: getEnvValue('TELEGRAM_BOT_TOKEN'),
  groqApiKey: getEnvValue('GROQ_API_KEY'),
  assemblyAiApiKey: getEnvValue('ASSEMBLYAI_API_KEY'),
};
