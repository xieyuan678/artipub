'use server';

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/connection';
import { TABLES, type PlatformCredential } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || 'default-user';
  const platformId = searchParams.get('platformId');
  
  try {
    if (platformId) {
      const credential = await queryOne<PlatformCredential>(
        `SELECT * FROM ${TABLES.PLATFORM_CREDENTIALS} WHERE user_id = $1 AND platform_id = $2`,
        [userId, platformId]
      );
      return NextResponse.json(credential || null);
    }
    
    const credentials = await query<PlatformCredential>(
      `SELECT * FROM ${TABLES.PLATFORM_CREDENTIALS} WHERE user_id = $1`,
      [userId]
    );
    
    return NextResponse.json(credentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default-user', platformId, cookies, apiKey } = body;
    
    if (!platformId) {
      return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
    }
    
    const existingCredential = await queryOne<PlatformCredential>(
      `SELECT * FROM ${TABLES.PLATFORM_CREDENTIALS} WHERE user_id = $1 AND platform_id = $2`,
      [userId, platformId]
    );
    
    if (existingCredential) {
      await query(
        `UPDATE ${TABLES.PLATFORM_CREDENTIALS} 
         SET cookies = $1, api_key = $2, updated_at = $3 
         WHERE user_id = $4 AND platform_id = $5`,
        [JSON.stringify(cookies), apiKey, new Date(), userId, platformId]
      );
      
      const updatedCredential = await queryOne<PlatformCredential>(
        `SELECT * FROM ${TABLES.PLATFORM_CREDENTIALS} WHERE user_id = $1 AND platform_id = $2`,
        [userId, platformId]
      );
      
      return NextResponse.json(updatedCredential);
    }
    
    const credential: PlatformCredential = {
      id: generateId(),
      user_id: userId,
      platform_id: platformId,
      cookies,
      api_key: apiKey,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    await query(
      `INSERT INTO ${TABLES.PLATFORM_CREDENTIALS} (id, user_id, platform_id, cookies, api_key, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [credential.id, credential.user_id, credential.platform_id, JSON.stringify(credential.cookies || {}), credential.api_key || null, credential.created_at.toISOString(), credential.updated_at.toISOString()]
    );
    
    return NextResponse.json(credential, { status: 201 });
  } catch (error) {
    console.error('Error saving credentials:', error);
    return NextResponse.json({ error: 'Failed to save credentials' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || 'default-user';
  const platformId = searchParams.get('platformId');
  
  if (!platformId) {
    return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
  }
  
  try {
    await query(
      `DELETE FROM ${TABLES.PLATFORM_CREDENTIALS} WHERE user_id = $1 AND platform_id = $2`,
      [userId, platformId]
    );
    
    return NextResponse.json({ message: 'Credentials deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting credentials:', error);
    return NextResponse.json({ error: 'Failed to delete credentials' }, { status: 500 });
  }
}
