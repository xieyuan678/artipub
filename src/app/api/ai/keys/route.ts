import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/connection';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || 'default-user';
  
  try {
    const keys = await queryOne<{ openai_key: string | null; anthropic_key: string | null; deepseek_key: string | null }>(
      'SELECT openai_key, anthropic_key, deepseek_key FROM ai_keys WHERE user_id = $1',
      [userId]
    );
    
    return NextResponse.json(keys || { openai_key: null, anthropic_key: null, deepseek_key: null });
  } catch (error) {
    console.error('Error fetching AI keys:', error);
    return NextResponse.json({ error: 'Failed to fetch AI keys' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default-user', openaiKey, anthropicKey, deepseekKey } = body;
    
    const existingKeys = await queryOne<{ id: string }>(
      'SELECT id FROM ai_keys WHERE user_id = $1',
      [userId]
    );
    
    if (existingKeys) {
      await query(
        'UPDATE ai_keys SET openai_key = $1, anthropic_key = $2, deepseek_key = $3, updated_at = $4 WHERE user_id = $5',
        [openaiKey || null, anthropicKey || null, deepseekKey || null, new Date().toISOString(), userId]
      );
      
      return NextResponse.json({ message: 'AI keys updated successfully' });
    }
    
    await query(
      'INSERT INTO ai_keys (id, user_id, openai_key, anthropic_key, deepseek_key, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [randomUUID(), userId, openaiKey || null, anthropicKey || null, deepseekKey || null, new Date().toISOString(), new Date().toISOString()]
    );
    
    return NextResponse.json({ message: 'AI keys saved successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error saving AI keys:', error);
    return NextResponse.json({ error: 'Failed to save AI keys' }, { status: 500 });
  }
}