import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function initDatabase() {
  console.log('开始初始化数据库...');

  try {
    console.log('创建 users 表...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('创建 articles 表...');
    await sql`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        tags TEXT[],
        status TEXT DEFAULT 'draft',
        platform_versions JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('创建 platform_credentials 表...');
    await sql`
      CREATE TABLE IF NOT EXISTS platform_credentials (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        platform_id TEXT NOT NULL,
        cookies JSONB,
        api_key TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, platform_id)
      )
    `;

    console.log('创建 ai_keys 表...');
    await sql`
      CREATE TABLE IF NOT EXISTS ai_keys (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        openai_key TEXT,
        anthropic_key TEXT,
        deepseek_key TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `;

    console.log('创建 publishing_tasks 表...');
    await sql`
      CREATE TABLE IF NOT EXISTS publishing_tasks (
        id TEXT PRIMARY KEY,
        article_id TEXT REFERENCES articles(id),
        user_id TEXT REFERENCES users(id),
        platforms TEXT[],
        status TEXT DEFAULT 'pending',
        results JSONB,
        strategy JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('创建索引...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_platform_credentials_user_id ON platform_credentials(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_publishing_tasks_user_id ON publishing_tasks(user_id)`;

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
