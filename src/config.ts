import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Discord bot configuration
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
export const CLIENT_ID = process.env.CLIENT_ID || '';
export const GUILD_ID = process.env.GUILD_ID;

// API endpoints
export const GIVETH_PROD_URL = process.env.GIVETH_PROD_URL || 'https://mainnet.serve.giveth.io/graphql';
export const DEVOUCH_PROD_URL = process.env.DEVOUCH_PROD_URL || 'https://optimism.backend.devouch.xyz/graphql';

// DeVouch configuration
export const DEVOUCH_TARGET_ORGANIZATION = process.env.DEVOUCH_TARGET_ORGANIZATION || 
  '0xf63f2a7159ee674aa6fce42196a8bb0605eafcf20c19e91a7eafba8d39fa0404';
export const DEVOUCH_MIN_THRESHOLD = parseInt(process.env.DEVOUCH_MIN_THRESHOLD || '3', 10);
export const DEVOUCH_PROJECTS_LIMIT = parseInt(process.env.DEVOUCH_PROJECTS_LIMIT || '150', 10);

// Validate required configuration
if (!DISCORD_TOKEN) {
  throw new Error('Missing DISCORD_TOKEN in environment variables');
}

if (!CLIENT_ID) {
  throw new Error('Missing CLIENT_ID in environment variables');
}
