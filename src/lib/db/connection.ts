import { Pool } from '@neondatabase/serverless';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const { rows } = await pool.query(sql, params);
  return rows as T[];
}

export async function queryOne<T>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}
