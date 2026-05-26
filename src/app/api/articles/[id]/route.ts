import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/connection';
import { TABLES, type Article } from '@/lib/db/schema';

type Params = { id: string };

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const { id } = await context.params;
  
  try {
    const article = await queryOne<Article>(
      `SELECT * FROM ${TABLES.ARTICLES} WHERE id = $1`,
      [id]
    );
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(_request: Request, context: { params: Promise<Params> }) {
  const { id } = await context.params;
  
  try {
    const body = await _request.json();
    
    const updateFields: string[] = [];
    const updateValues: (string | number | boolean | null)[] = [];
    let paramIndex = 1;
    
    if (body.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(body.title);
    }
    if (body.content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      updateValues.push(body.content);
    }
    if (body.summary !== undefined) {
      updateFields.push(`summary = $${paramIndex++}`);
      updateValues.push(body.summary);
    }
    if (body.tags !== undefined) {
      updateFields.push(`tags = $${paramIndex++}`);
      updateValues.push(body.tags);
    }
    if (body.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(body.status);
    }
    if (body.platformVersions !== undefined) {
      updateFields.push(`platform_versions = $${paramIndex++}`);
      updateValues.push(JSON.stringify(body.platformVersions));
    }
    
    updateFields.push(`updated_at = $${paramIndex++}`);
    updateValues.push(new Date().toISOString());
    
    updateValues.push(id);
    
    if (updateFields.length === 1) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    await query(
      `UPDATE ${TABLES.ARTICLES} SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      updateValues
    );
    
    const updatedArticle = await queryOne<Article>(
      `SELECT * FROM ${TABLES.ARTICLES} WHERE id = $1`,
      [id]
    );
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<Params> }) {
  const { id } = await context.params;
  
  try {
    await query(
      `DELETE FROM ${TABLES.ARTICLES} WHERE id = $1`,
      [id]
    );
    
    return NextResponse.json({ message: 'Article deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
