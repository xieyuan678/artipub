'use server';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { TABLES, type PublishingTask } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { aiService } from '@/lib/ai/ai-service';
import { PLATFORMS } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, platformIds, userId = 'default-user' } = body;
    
    if (!articleId || !platformIds || platformIds.length === 0) {
      return NextResponse.json({ error: 'Article ID and platforms are required' }, { status: 400 });
    }
    
    const platforms = PLATFORMS.filter(p => platformIds.includes(p.id));
    
    const results: PublishingTask['results'] = {};
    platforms.forEach(platform => {
      results[platform.id] = { status: 'pending' };
    });
    
    const task: PublishingTask = {
      id: generateId(),
      article_id: articleId,
      user_id: userId,
      platforms: platformIds,
      status: 'processing',
      results,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    await query(
      `INSERT INTO ${TABLES.PUBLISHING_TASKS} (id, article_id, user_id, platforms, status, results, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [task.id, task.article_id, task.user_id, JSON.stringify(task.platforms), task.status, JSON.stringify(task.results), task.created_at.toISOString(), task.updated_at.toISOString()]
    );
    
    processPublishingTask(task.id, articleId, platformIds);
    
    return NextResponse.json({ taskId: task.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating publishing task:', error);
    return NextResponse.json({ error: 'Failed to create publishing task' }, { status: 500 });
  }
}

async function processPublishingTask(taskId: string, articleId: string, platformIds: string[]) {
  try {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const strategy = await aiService.generatePublishingStrategy(
      'Article content',
      'Article title',
      platformIds
    );
    
    await query(
      `UPDATE ${TABLES.PUBLISHING_TASKS} SET strategy = $1, updated_at = $2 WHERE id = $3`,
      [JSON.stringify(strategy), new Date().toISOString(), taskId]
    );
    
    const immediatePublish = strategy.publishingSchedule.immediate || platformIds;
    
    for (const platformId of immediatePublish) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      try {
        const success = Math.random() > 0.1;
        
        if (success) {
          await query(
            `UPDATE ${TABLES.PUBLISHING_TASKS} 
             SET results = jsonb_set(results, ARRAY[$1], $2::jsonb), updated_at = $3 
             WHERE id = $4`,
            [platformId, JSON.stringify({ status: 'success', url: `https://example.com/article/${generateId()}`, published_at: new Date().toISOString() }), new Date().toISOString(), taskId]
          );
        } else {
          await query(
            `UPDATE ${TABLES.PUBLISHING_TASKS} 
             SET results = jsonb_set(results, ARRAY[$1], $2::jsonb), updated_at = $3 
             WHERE id = $4`,
            [platformId, JSON.stringify({ status: 'failed', error: 'Platform temporarily unavailable' }), new Date().toISOString(), taskId]
          );
        }
      } catch (error) {
        console.error(`Error publishing to ${platformId}:`, error);
        await query(
          `UPDATE ${TABLES.PUBLISHING_TASKS} 
           SET results = jsonb_set(results, ARRAY[$1], $2::jsonb), updated_at = $3 
           WHERE id = $4`,
          [platformId, JSON.stringify({ status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }), new Date().toISOString(), taskId]
        );
      }
    }
    
    await query(
      `UPDATE ${TABLES.PUBLISHING_TASKS} SET status = $1, updated_at = $2 WHERE id = $3`,
      ['completed', new Date().toISOString(), taskId]
    );
    
  } catch (error) {
    console.error('Error processing publishing task:', error);
    await query(
      `UPDATE ${TABLES.PUBLISHING_TASKS} SET status = $1, updated_at = $2 WHERE id = $3`,
      ['failed', new Date().toISOString(), taskId]
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || 'default-user';
  const taskId = searchParams.get('taskId');
  
  try {
    if (taskId) {
      const tasks = await query<PublishingTask>(
        `SELECT * FROM ${TABLES.PUBLISHING_TASKS} WHERE id = $1`,
        [taskId]
      );
      return NextResponse.json(tasks[0] || null);
    }
    
    const tasks = await query<PublishingTask>(
      `SELECT * FROM ${TABLES.PUBLISHING_TASKS} WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching publishing tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch publishing tasks' }, { status: 500 });
  }
}
