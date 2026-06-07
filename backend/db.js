import { Pool } from 'pg';

const hasDatabase = Boolean(process.env.DATABASE_URL);

export const pool = hasDatabase
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined
    })
  : null;

export const isDatabaseConfigured = hasDatabase;

export function requireDb() {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured.');
  }
  return pool;
}
