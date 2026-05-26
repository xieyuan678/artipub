import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db/connection';
import { createPublisher, PlatformType, PublishArticle } from '@/lib/publish/platform-publishers';

interface PlatformCredential {
  id: string;
  user_id: string;
  platform: string;
  access_token: string | null;
  refresh_token: string | null;
  cookies: string | null;
  expires_at: number | null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: '未授权，请先登录' },
      { status: 401 }
    );
  }

  try {
    const { platforms, article } = await request.json();

    if (!platforms || !article) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const results: { platform: string; success: boolean; url?: string; error?: string }[] = [];

    for (const platform of platforms) {
      const credentials = await queryOne<PlatformCredential>(
        'SELECT * FROM platform_credentials WHERE user_id = $1 AND platform = $2',
        [session.user.id, platform]
      );

      if (!credentials) {
        results.push({
          platform,
          success: false,
          error: '该平台未配置凭证',
        });
        continue;
      }

      try {
        const publisher = createPublisher({
          platform: platform as PlatformType,
          accessToken: credentials.access_token || undefined,
          refreshToken: credentials.refresh_token || undefined,
          cookies: credentials.cookies ? JSON.parse(credentials.cookies) : undefined,
          expiresAt: credentials.expires_at || undefined,
          userId: credentials.user_id,
        });

        const publishArticle: PublishArticle = {
          title: article.title,
          content: article.content,
          tags: article.tags || [],
          description: article.description,
          coverImage: article.coverImage,
        };

        const result = await publisher.publish(publishArticle);

        await query(
          'INSERT INTO publishing_tasks (user_id, article_id, platform, status, result) VALUES ($1, $2, $3, $4, $5)',
          [session.user.id, article.id || null, platform, result.success ? 'completed' : 'failed', JSON.stringify(result)]
        );

        results.push({
          platform,
          success: result.success,
          url: result.postUrl,
          error: result.errorMessage,
        });
      } catch (error) {
        console.error(`发布到 ${platform} 失败:`, error);
        results.push({
          platform,
          success: false,
          error: '发布过程中发生错误',
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('发布失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
