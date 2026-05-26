import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/connection';
import { TABLES, type Article } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || 'default-user';
  
  try {
    const articles = await query<Article>(
      `SELECT * FROM ${TABLES.ARTICLES} WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, userId = 'default-user' } = body;
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const article: Article = {
      id: generateId(),
      user_id: userId,
      title,
      content,
      summary: body.summary,
      tags: body.tags || [],
      status: 'draft',
      platform_versions: body.platformVersions,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    await query(
      `INSERT INTO ${TABLES.ARTICLES} (id, user_id, title, content, summary, tags, status, platform_versions, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [article.id, article.user_id, article.title, article.content, article.summary || null, JSON.stringify(article.tags), article.status, JSON.stringify(article.platform_versions || {}), article.created_at.toISOString(), article.updated_at.toISOString()]
    );
    
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
