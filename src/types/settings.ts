export interface AIModel {
  id: string
  name: string
  provider: string
  contextLength: number
  pricing?: {
    prompt: number
    completion: number
  }
}

export interface Settings {
  model: string
  temperature: number
  maxTokens: number
  theme: 'dark' | 'light' | 'system'
}

export const DEFAULT_SETTINGS: Settings = {
  model: 'microsoft/wizardlm-2-8x22b',
  temperature: 0.7,
  maxTokens: 1000,
  theme: 'dark',
}

export const POPULAR_MODELS: AIModel[] = [
  {
    id: 'microsoft/wizardlm-2-8x22b',
    name: 'WizardLM-2 8x22B',
    provider: 'Microsoft',
    contextLength: 65536,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextLength: 200000,
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    contextLength: 128000,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextLength: 128000,
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    contextLength: 1000000,
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    contextLength: 131072,
  },
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    contextLength: 128000,
  },
  {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    contextLength: 128000,
  },
]
