import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai/ai-service';
import { AI_PROVIDERS } from '@/lib/ai/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, provider } = body;
    
    if (!content || !title) {
      return NextResponse.json({ error: 'Content and title are required' }, { status: 400 });
    }
    
    const validProviders = AI_PROVIDERS.map(p => p.type);
    if (provider && validProviders.includes(provider)) {
      aiService.setProvider(provider);
    }
    
    const result = await aiService.optimizeArticle(content, title);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI optimization error:', error);
    return NextResponse.json({ error: 'Failed to optimize article' }, { status: 500 });
  }
}
