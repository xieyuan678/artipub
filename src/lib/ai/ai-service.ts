import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { AIProviderType, getProviderConfig, AI_PROVIDERS } from './providers';

export class AIService {
  private currentProvider: AIProviderType;

  constructor(provider: AIProviderType = 'openai') {
    this.currentProvider = provider;
  }

  setProvider(provider: AIProviderType): void {
    this.currentProvider = provider;
  }

  getCurrentProvider(): AIProviderType {
    return this.currentProvider;
  }

  getAvailableProviders(): typeof AI_PROVIDERS {
    return AI_PROVIDERS;
  }

  private getModel() {
    const config = getProviderConfig(this.currentProvider);

    switch (this.currentProvider) {
      case 'openai': {
        return openai(config.model || 'gpt-4o');
      }
      case 'anthropic': {
        return anthropic(config.model || 'claude-3-sonnet');
      }
      case 'deepseek': {
        return openai(config.model || 'deepseek-chat');
      }
      default: {
        return openai('gpt-4o');
      }
    }
  }

  async optimizeArticle(content: string, title: string): Promise<{
    title: string;
    summary: string;
    tags: string[];
    platformSpecificContent: Record<string, string>;
  }> {
    const model = this.getModel();

    const prompt = `
      Optimize the following article for multi-platform publishing:

      Title: ${title}

      Content: ${content.substring(0, 2000)}

      Please provide your response in JSON format with the following structure:
      {
        "title": "Optimized title",
        "summary": "A concise summary of the article",
        "tags": ["tag1", "tag2", "tag3", "tag4"],
        "platformSpecificContent": {
          "zhihu": "Content optimized for Zhihu (academic style)",
          "juejin": "Content optimized for Juejin (developer community)",
          "csdn": "Content optimized for CSDN (technical tutorial)",
          "jianshu": "Content optimized for Jianshu (narrative style)",
          "segmentfault": "Content optimized for SegmentFault (Q&A style)",
          "oschina": "Content optimized for OSChina (open source community)"
        }
      }

      Make sure the platform-specific content maintains the original meaning while adapting to each platform's audience.
    `.trim();

    try {
      const { text } = await generateText({
        model,
        prompt,
      });

      return JSON.parse(text);
    } catch (error) {
      console.error('AI optimization failed:', error);
      return {
        title: `${title} - AI Optimized`,
        summary: 'This article has been optimized by AI for maximum engagement across multiple platforms.',
        tags: ['AI', 'Technology', 'Publishing', 'Automation'],
        platformSpecificContent: {
          zhihu: `${content}\n\n[Optimized for Zhihu's academic audience]`,
          juejin: `${content}\n\n[Optimized for Juejin's developer community]`,
          csdn: `${content}\n\n[Optimized for CSDN's technical tutorials]`,
          jianshu: `${content}\n\n[Optimized for Jianshu's narrative style]`,
          segmentfault: `${content}\n\n[Optimized for SegmentFault's Q&A style]`,
          oschina: `${content}\n\n[Optimized for OSChina's open source community]`,
        },
      };
    }
  }

  async generatePublishingStrategy(content: string, title: string, userPreferences?: string[]): Promise<{
    recommendedPlatforms: string[];
    publishingSchedule: {
      immediate: string[];
      delayed: { platform: string; delayMinutes: number; reason: string }[];
    };
    customizations: Record<string, string>;
  }> {
    const model = this.getModel();

    const prompt = `
      Analyze this article and provide a publishing strategy:

      Title: ${title}

      Content: ${content.substring(0, 1000)}

      User preferred platforms: ${userPreferences?.join(', ') || 'None specified'}

      Please provide your response in JSON format:
      {
        "recommendedPlatforms": ["zhihu", "juejin", "csdn"],
        "publishingSchedule": {
          "immediate": ["zhihu", "juejin"],
          "delayed": [
            {"platform": "csdn", "delayMinutes": 30, "reason": "Better engagement in afternoon"}
          ]
        },
        "customizations": {
          "zhihu": "Focus on technical depth",
          "juejin": "Include code examples",
          "csdn": "Step-by-step tutorial format"
        }
      }

      Platforms available: zhihu, juejin, csdn, jianshu, segmentfault, oschina
    `.trim();

    try {
      const { text } = await generateText({
        model,
        prompt,
      });

      return JSON.parse(text);
    } catch (error) {
      console.error('AI strategy generation failed:', error);
      return {
        recommendedPlatforms: userPreferences || ['zhihu', 'juejin', 'csdn'],
        publishingSchedule: {
          immediate: userPreferences || ['zhihu', 'juejin'],
          delayed: [
            { platform: 'csdn', delayMinutes: 30, reason: 'Better engagement in afternoon' }
          ]
        },
        customizations: {
          zhihu: 'Focus on technical depth',
          juejin: 'Include code examples',
          csdn: 'Step-by-step tutorial format'
        }
      };
    }
  }

  async generateMetadata(content: string, title: string, platform: string): Promise<{
    description: string;
    keywords: string[];
    category: string;
    tips: string;
  }> {
    const model = this.getModel();

    const prompt = `
      Generate metadata for publishing this article on ${platform}:

      Title: ${title}

      Content: ${content.substring(0, 500)}

      Provide JSON response:
      {
        "description": "Article description for SEO",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "category": "Technology",
        "tips": "Optimization tips for this platform"
      }
    `.trim();

    try {
      const { text } = await generateText({
        model,
        prompt,
      });

      return JSON.parse(text);
    } catch (error) {
      console.error('AI metadata generation failed:', error);
      return {
        description: `${title} - Optimized for ${platform}`,
        keywords: ['AI', 'Technology', 'Publishing'],
        category: 'Technology',
        tips: `Optimized for ${platform} audience engagement`
      };
    }
  }
}

export const aiService = new AIService('openai');
