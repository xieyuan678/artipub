import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai/ai-service';
import { AI_PROVIDERS } from '@/lib/ai/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, userPreferences, provider } = body;
    
    if (!content || !title) {
      return NextResponse.json({ error: 'Content and title are required' }, { status: 400 });
    }
    
    const validProviders = AI_PROVIDERS.map(p => p.type);
    if (provider && validProviders.includes(provider)) {
      aiService.setProvider(provider);
    }
    
    const result = await aiService.generatePublishingStrategy(content, title, userPreferences);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI strategy generation error:', error);
    return NextResponse.json({ error: 'Failed to generate publishing strategy' }, { status: 500 });
  }
}
