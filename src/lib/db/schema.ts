export const TABLES = {
  USERS: 'users',
  ARTICLES: 'articles',
  PLATFORM_CREDENTIALS: 'platform_credentials',
  PUBLISHING_TASKS: 'publishing_tasks',
};

export const createTables = `
CREATE TABLE IF NOT EXISTS ${TABLES.USERS} (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ${TABLES.ARTICLES} (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES ${TABLES.USERS}(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft',
  platform_versions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ${TABLES.PLATFORM_CREDENTIALS} (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES ${TABLES.USERS}(id),
  platform_id TEXT NOT NULL,
  cookies JSONB,
  api_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, platform_id)
);

CREATE TABLE IF NOT EXISTS ${TABLES.PUBLISHING_TASKS} (
  id TEXT PRIMARY KEY,
  article_id TEXT REFERENCES ${TABLES.ARTICLES}(id),
  user_id TEXT REFERENCES ${TABLES.USERS}(id),
  platforms TEXT[],
  status TEXT DEFAULT 'pending',
  results JSONB,
  strategy JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: Date;
}

export interface Article {
  id: string;
  user_id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  status: 'draft' | 'optimized' | 'published' | 'failed';
  platform_versions?: Record<string, { title: string; content: string; metadata: Record<string, unknown> }>;
  created_at: Date;
  updated_at: Date;
}

export interface PlatformCredential {
  id: string;
  user_id: string;
  platform_id: string;
  cookies?: Record<string, string>;
  api_key?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PublishingTask {
  id: string;
  article_id: string;
  user_id: string;
  platforms: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: Record<string, {
    status: 'success' | 'failed' | 'pending';
    url?: string;
    error?: string;
    published_at?: Date;
  }>;
  strategy?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}
