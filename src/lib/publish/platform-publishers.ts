export type PlatformType = 'zhihu' | 'juejin' | 'csdn' | 'jianshu' | 'segmentfault' | 'oschina';

export interface PlatformCredentials {
  platform: PlatformType;
  accessToken?: string;
  refreshToken?: string;
  cookies?: Record<string, string>;
  expiresAt?: number;
  userId?: string;
}

export interface PublishResult {
  success: boolean;
  postUrl?: string;
  errorMessage?: string;
  platform: PlatformType;
}

export interface PublishArticle {
  title: string;
  content: string;
  tags: string[];
  description?: string;
  coverImage?: string;
}

export abstract class PlatformPublisher {
  protected credentials: PlatformCredentials;

  constructor(credentials: PlatformCredentials) {
    this.credentials = credentials;
  }

  abstract publish(article: PublishArticle): Promise<PublishResult>;
  abstract getPlatformName(): string;
  abstract getPlatformType(): PlatformType;

  protected async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = new Headers(options.headers);
    
    if (this.credentials.accessToken) {
      headers.set('Authorization', `Bearer ${this.credentials.accessToken}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

export class ZhihuPublisher extends PlatformPublisher {
  getPlatformName(): string {
    return '知乎';
  }

  getPlatformType(): PlatformType {
    return 'zhihu';
  }

  async publish(article: PublishArticle): Promise<PublishResult> {
    try {
      if (!this.credentials.cookies || !this.credentials.cookies['z_c0']) {
        return {
          success: false,
          platform: 'zhihu',
          errorMessage: '请先配置知乎登录凭证',
        };
      }

      const cookieString = Object.entries(this.credentials.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

      const response = await fetch('https://api.zhihu.com/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieString,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          excerpt: article.description || article.content.substring(0, 150),
          tags: article.tags.slice(0, 5),
          is_private: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          platform: 'zhihu',
          postUrl: `https://zhuanlan.zhihu.com/p/${data.id}`,
        };
      }

      return {
        success: false,
        platform: 'zhihu',
        errorMessage: '发布失败，请检查凭证是否有效',
      };
    } catch (error) {
      console.error('知乎发布失败:', error);
      return {
        success: false,
        platform: 'zhihu',
        errorMessage: '网络错误或知乎API暂时不可用',
      };
    }
  }
}

export class JuejinPublisher extends PlatformPublisher {
  getPlatformName(): string {
    return '掘金';
  }

  getPlatformType(): PlatformType {
    return 'juejin';
  }

  async publish(article: PublishArticle): Promise<PublishResult> {
    try {
      if (!this.credentials.accessToken) {
        return {
          success: false,
          platform: 'juejin',
          errorMessage: '请先配置掘金 accessToken',
        };
      }

      const response = await fetch('https://api.juejin.cn/content_api/v1/article/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': this.credentials.accessToken,
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          tags: article.tags.slice(0, 5).map(tag => ({ name: tag })),
          category_id: 1,
          type: 1,
          cover_image: article.coverImage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.err_no === 0) {
          return {
            success: true,
            platform: 'juejin',
            postUrl: `https://juejin.cn/post/${data.data.article_id}`,
          };
        }
      }

      return {
        success: false,
        platform: 'juejin',
        errorMessage: '发布失败，请检查凭证是否有效',
      };
    } catch (error) {
      console.error('掘金发布失败:', error);
      return {
        success: false,
        platform: 'juejin',
        errorMessage: '网络错误或掘金API暂时不可用',
      };
    }
  }
}

export class CSDNPublisher extends PlatformPublisher {
  getPlatformName(): string {
    return 'CSDN';
  }

  getPlatformType(): PlatformType {
    return 'csdn';
  }

  async publish(article: PublishArticle): Promise<PublishResult> {
    try {
      if (!this.credentials.cookies || !this.credentials.cookies['UserName']) {
        return {
          success: false,
          platform: 'csdn',
          errorMessage: '请先配置CSDN登录凭证',
        };
      }

      const cookieString = Object.entries(this.credentials.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

      const response = await fetch('https://blog.csdn.net/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieString,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          tags: article.tags.slice(0, 5).join(','),
          categories: '',
          type: 'original',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          platform: 'csdn',
          postUrl: data.url,
        };
      }

      return {
        success: false,
        platform: 'csdn',
        errorMessage: '发布失败，请检查凭证是否有效',
      };
    } catch (error) {
      console.error('CSDN发布失败:', error);
      return {
        success: false,
        platform: 'csdn',
        errorMessage: '网络错误或CSDN API暂时不可用',
      };
    }
  }
}

export class JianShuPublisher extends PlatformPublisher {
  getPlatformName(): string {
    return '简书';
  }

  getPlatformType(): PlatformType {
    return 'jianshu';
  }

  async publish(article: PublishArticle): Promise<PublishResult> {
    try {
      if (!this.credentials.cookies) {
        return {
          success: false,
          platform: 'jianshu',
          errorMessage: '请先配置简书登录凭证',
        };
      }

      const cookieString = Object.entries(this.credentials.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

      const response = await fetch('https://www.jianshu.com/asimov/posts.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieString,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          is_private: false,
          note_type: 2,
          tags: article.tags.slice(0, 5),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          platform: 'jianshu',
          postUrl: `https://www.jianshu.com/p/${data.slug}`,
        };
      }

      return {
        success: false,
        platform: 'jianshu',
        errorMessage: '发布失败，请检查凭证是否有效',
      };
    } catch (error) {
      console.error('简书发布失败:', error);
      return {
        success: false,
        platform: 'jianshu',
        errorMessage: '网络错误或简书API暂时不可用',
      };
    }
  }
}

export class SegmentFaultPublisher extends PlatformPublisher {
  getPlatformName(): string {
    return '思否';
  }

  getPlatformType(): PlatformType {
    return 'segmentfault';
  }

  async publish(article: PublishArticle): Promise<PublishResult> {
    try {
      if (!this.credentials.accessToken) {
        return {
          success: false,
          platform: 'segmentfault',
          errorMessage: '请先配置思否 accessToken',
        };
      }

      const response = await fetch('https://segmentfault.com/api/article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.credentials.accessToken}`,
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          tags: article.tags.slice(0, 5),
          type: 'article',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          platform: 'segmentfault',
          postUrl: `https://segmentfault.com/a/${data.id}`,
        };
      }

      return {
        success: false,
        platform: 'segmentfault',
        errorMessage: '发布失败，请检查凭证是否有效',
      };
    } catch (error) {
      console.error('思否发布失败:', error);
      return {
        success: false,
        platform: 'segmentfault',
        errorMessage: '网络错误或思否API暂时不可用',
      };
    }
  }
}

export class OSChinaPublisher extends PlatformPublisher {
  getPlatformName(): string {
    return '开源中国';
  }

  getPlatformType(): PlatformType {
    return 'oschina';
  }

  async publish(article: PublishArticle): Promise<PublishResult> {
    try {
      if (!this.credentials.accessToken) {
        return {
          success: false,
          platform: 'oschina',
          errorMessage: '请先配置开源中国 accessToken',
        };
      }

      const response = await fetch('https://www.oschina.net/api/post/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.credentials.accessToken}`,
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          tags: article.tags.slice(0, 5),
          type: 'article',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          platform: 'oschina',
          postUrl: `https://my.oschina.net/u/${this.credentials.userId}/blog/${data.id}`,
        };
      }

      return {
        success: false,
        platform: 'oschina',
        errorMessage: '发布失败，请检查凭证是否有效',
      };
    } catch (error) {
      console.error('开源中国发布失败:', error);
      return {
        success: false,
        platform: 'oschina',
        errorMessage: '网络错误或开源中国API暂时不可用',
      };
    }
  }
}

export type PlatformPublisherClass = {
  new (credentials: PlatformCredentials): PlatformPublisher;
};

export const PLATFORM_PUBLISHERS: Record<PlatformType, PlatformPublisherClass> = {
  zhihu: ZhihuPublisher,
  juejin: JuejinPublisher,
  csdn: CSDNPublisher,
  jianshu: JianShuPublisher,
  segmentfault: SegmentFaultPublisher,
  oschina: OSChinaPublisher,
};

export function createPublisher(credentials: PlatformCredentials): PlatformPublisher {
  const PublisherClass = PLATFORM_PUBLISHERS[credentials.platform];
  if (!PublisherClass) {
    throw new Error(`不支持的平台: ${credentials.platform}`);
  }
  return new PublisherClass(credentials);
}
