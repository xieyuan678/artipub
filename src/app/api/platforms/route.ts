import { NextRequest, NextResponse } from 'next/server';
import { PLATFORMS, getPlatformById } from '@/lib/types';

export async function GET(request: NextRequest) {
  return NextResponse.json(PLATFORMS);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platformId } = body;
    
    const platform = getPlatformById(platformId);
    
    if (!platform) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }
    
    return NextResponse.json(platform);
  } catch (error) {
    console.error('Error fetching platform:', error);
    return NextResponse.json({ error: 'Failed to fetch platform' }, { status: 500 });
  }
}
