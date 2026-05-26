export type AIProviderType = 'openai' | 'anthropic' | 'deepseek' | 'custom';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface AIProvider {
  name: string;
  type: AIProviderType;
  defaultModel: string;
  supportsStreaming: boolean;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'OpenAI',
    type: 'openai',
    defaultModel: 'gpt-4o',
    supportsStreaming: true,
  },
  {
    name: 'Anthropic',
    type: 'anthropic',
    defaultModel: 'claude-3-sonnet',
    supportsStreaming: true,
  },
  {
    name: 'DeepSeek',
    type: 'deepseek',
    defaultModel: 'deepseek-chat',
    supportsStreaming: true,
  },
];

export const getProviderConfig = (type: AIProviderType): AIProviderConfig => {
  switch (type) {
    case 'openai':
      return {
        type: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o',
      };
    case 'anthropic':
      return {
        type: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet',
      };
    case 'deepseek':
      return {
        type: 'deepseek',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseUrl: 'https://api.deepseek.com/v1',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      };
    default:
      return {
        type: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o',
      };
  }
};
