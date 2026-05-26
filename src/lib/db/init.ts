'use server';

import { pool, query } from './connection';
import { createTables } from './schema';

export async function initDatabase(): Promise<void> {
  try {
    await pool.query(createTables);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function ensureDatabase(): Promise<void> {
  try {
    await query('SELECT 1');
  } catch {
    await initDatabase();
  }
}
