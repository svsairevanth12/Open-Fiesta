import { AiModel } from './types';

// Base catalog; user can toggle/select up to 5
export const MODEL_CATALOG: AiModel[] = [
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    good: true,
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
  },
  {
    id: 'deepcoder-14b-preview',
    label: 'DeepCoder 14B Preview',
    provider: 'openrouter',
    model: 'agentica-org/deepcoder-14b-preview:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'deepseek-r1',
    label: 'DeepSeek R1',
    provider: 'openrouter',
    model: 'deepseek/deepseek-r1:free',
    good: true,
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'deepseek-chat-v3-0324-free',
    label: 'DeepSeek Chat v3 0324',
    provider: 'openrouter',
    model: 'deepseek/deepseek-chat-v3-0324:free',
    good: true,
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B Instruct (free)',
    provider: 'openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    good: true,
    // OpenRouter models require API key (BYOK)
  },
  // Additional OpenRouter models requested
  {
    id: 'mistral-small-24b-instruct-2501',
    label: 'Mistral Small 24B Instruct 2501',
    provider: 'openrouter',
    model: 'mistralai/mistral-small-24b-instruct-2501:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'qwen-2.5-72b-instruct',
    label: 'Qwen 2.5 72B Instruct (free)',
    provider: 'openrouter',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    good: true,
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'moonshot-kimi-k2',
    label: 'Moonshot Kimi K2 (free)',
    provider: 'openrouter',
    model: 'moonshotai/kimi-k2:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'reka-flash-3',
    label: 'Reka Flash 3',
    provider: 'openrouter',
    model: 'reka/reka-flash-3:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'glm-4.5-air',
    label: 'GLM 4.5 Air (free)',
    provider: 'openrouter',
    model: 'z-ai/glm-4.5-air:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'glm-4.5-air-paid',
    label: 'GLM 4.5 Air (paid)',
    provider: 'openrouter',
    model: 'z-ai/glm-4.5-air',
  },
  {
    id: 'hunyuan-a13b-instruct',
    label: 'Tencent Hunyuan A13B Instruct',
    provider: 'openrouter',
    model: 'tencent/hunyuan-a13b-instruct:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'gemma-3n-e2b-it',
    label: 'Google Gemma 3n e2B IT',
    provider: 'openrouter',
    model: 'google/gemma-3n-e2b-it:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'gemma-3-27b-it',
    label: 'Google Gemma 3 27B IT',
    provider: 'openrouter',
    model: 'google/gemma-3-27b-it:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'dolphin3-mistral-24b',
    label: 'Dolphin 3.0 Mistral 24B',
    provider: 'openrouter',
    model: 'cognitivecomputations/dolphin3.0-mistral-24b:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'gemma-2-9b-it',
    label: 'Google Gemma 2 9B IT',
    provider: 'openrouter',
    model: 'google/gemma-2-9b-it:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'shisa-v2-llama33-70b',
    label: 'Shisa v2 Llama 3.3 70B',
    provider: 'openrouter',
    model: 'shisa-ai/shisa-v2-llama3.3-70b:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'deepseek-r1t-chimera',
    label: 'DeepSeek R1T Chimera',
    provider: 'openrouter',
    model: 'tngtech/deepseek-r1t-chimera:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'microsoft-mai-ds-r1',
    label: 'Microsoft MAI DS-R1',
    provider: 'openrouter',
    model: 'microsoft/mai-ds-r1:free',
    // OpenRouter models require API key (BYOK)
  },
  // Newly requested models
  {
    id: 'baidu-ernie-4.5-21b-a3b',
    label: 'Baidu ERNIE 4.5 21B A3B',
    provider: 'openrouter',
    model: 'baidu/ernie-4.5-21b-a3b',
  },
  {
    id: 'openai-gpt-oss-20b-free',
    label: 'OpenAI GPT-OSS 20B',
    provider: 'openrouter',
    model: 'openai/gpt-oss-20b:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'xai-grok-3-mini',
    label: 'xAI Grok 3 Mini',
    provider: 'openrouter',
    model: 'x-ai/grok-3-mini',
  },

  // Open Provider Text Models - Official Models
  {
    id: 'open-deepseek-reasoning',
    label: 'DeepSeek R1 (Reasoning)',
    provider: 'open-provider',
    model: 'deepseek-reasoning',
    free: true,
    good: true,
    category: 'text',
  },
  {
    id: 'open-gemini',
    label: 'Gemini 2.5 Flash Lite',
    provider: 'open-provider',
    model: 'gemini',
    free: true,
    category: 'text',
  },
  {
    id: 'open-gpt-5-nano',
    label: 'GPT-5 Nano (Vision)',
    provider: 'open-provider',
    model: 'gpt-5-nano',
    free: true,
    good: true,
    category: 'text',
  },
  {
    id: 'open-llama-fast-roblox',
    label: 'Llama 3.2 1B (Vision)',
    provider: 'open-provider',
    model: 'llama-fast-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-llama-roblox',
    label: 'Llama 3.1 8B Instruct',
    provider: 'open-provider',
    model: 'llama-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-llamascout',
    label: 'Llama 4 Scout 17B',
    provider: 'open-provider',
    model: 'llamascout',
    free: true,
    good: true,
    category: 'text',
  },
  {
    id: 'open-mistral',
    label: 'Mistral Small 3.1 24B',
    provider: 'open-provider',
    model: 'mistral',
    free: true,
    category: 'text',
  },
  {
    id: 'open-mistral-nemo-roblox',
    label: 'Mistral Nemo Instruct 2407',
    provider: 'open-provider',
    model: 'mistral-nemo-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-mistral-roblox',
    label: 'Mistral Small 3.1 24B (Vision)',
    provider: 'open-provider',
    model: 'mistral-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-nova-fast',
    label: 'Amazon Nova Micro',
    provider: 'open-provider',
    model: 'nova-fast',
    free: true,
    category: 'text',
  },
  {
    id: 'open-openai',
    label: 'GPT-4.1 Nano (Vision)',
    provider: 'open-provider',
    model: 'openai',
    free: true,
    good: true,
    category: 'text',
  },
  {
    id: 'open-openai-fast',
    label: 'GPT-4.1 Nano Fast (Vision)',
    provider: 'open-provider',
    model: 'openai-fast',
    free: true,
    category: 'text',
  },
  {
    id: 'open-openai-large',
    label: 'GPT-4.1 Large (Vision)',
    provider: 'open-provider',
    model: 'openai-large',
    free: true,
    good: true,
    category: 'text',
  },

  {
    id: 'open-openai-roblox',
    label: 'GPT-4.1 Nano Roblox (Vision)',
    provider: 'open-provider',
    model: 'openai-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-qwen-coder',
    label: 'Qwen 2.5 Coder 32B',
    provider: 'open-provider',
    model: 'qwen-coder',
    free: true,
    category: 'text',
  },
  {
    id: 'open-roblox-rp',
    label: 'Roblox RP Multi-Model',
    provider: 'open-provider',
    model: 'roblox-rp',
    free: true,
    category: 'text',
  },

  // Open Provider Community Models
  {
    id: 'open-bidara',
    label: 'BIDARA (NASA Biomimetic Designer)',
    provider: 'open-provider',
    model: 'bidara',
    free: true,
    category: 'text',
  },
  {
    id: 'open-elixposearch',
    label: 'Elixpo Search',
    provider: 'open-provider',
    model: 'elixposearch',
    free: true,
    category: 'text',
  },
  {
    id: 'open-evil',
    label: 'Evil (Uncensored)',
    provider: 'open-provider',
    model: 'evil',
    free: true,
    category: 'text',
  },
  {
    id: 'open-midijourney',
    label: 'MIDIjourney',
    provider: 'open-provider',
    model: 'midijourney',
    free: true,
    category: 'text',
  },
  {
    id: 'open-mirexa',
    label: 'Mirexa AI Companion',
    provider: 'open-provider',
    model: 'mirexa',
    free: true,
    category: 'text',
  },
  {
    id: 'open-rtist',
    label: 'Rtist',
    provider: 'open-provider',
    model: 'rtist',
    free: true,
    category: 'text',
  },
  {
    id: 'open-sur',
    label: 'Sur AI Assistant',
    provider: 'open-provider',
    model: 'sur',
    free: true,
    category: 'text',
  },
  {
    id: 'open-unity',
    label: 'Unity Unrestricted Agent (Uncensored)',
    provider: 'open-provider',
    model: 'unity',
    free: true,
    category: 'text',
  },

  // Open Provider Audio Models
  {
    id: 'open-openai-audio',
    label: 'GPT-4o Mini Audio (Voice)',
    provider: 'open-provider',
    model: 'openai-audio',
    free: true,
    good: true,
    category: 'audio',
  },

  // Open Provider Image Models
  {
    id: 'open-flux',
    label: 'FLUX Image Generator (Open Provider)',
    provider: 'open-provider',
    model: 'flux',
    free: true,
    good: true,
    category: 'image',
  },
  {
    id: 'open-kontext',
    label: 'Kontext Image Generator (Open Provider)',
    provider: 'open-provider',
    model: 'kontext',
    free: true,
    category: 'image',
  },
  {
    id: 'open-turbo',
    label: 'Turbo Image Generator (Open Provider)',
    provider: 'open-provider',
    model: 'turbo',
    free: true,
    category: 'image',
  },

];
