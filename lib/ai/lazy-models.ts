// Lazy load AI model configurations
export const loadOpenAIConfig = async () => {
  const { openai } = await import('@ai-sdk/openai');
  return openai;
};

export const loadAnthropicConfig = async () => {
  const { anthropic } = await import('@ai-sdk/anthropic');
  return anthropic;
};

export const loadGoogleConfig = async () => {
  const { google } = await import('@ai-sdk/google');
  return google;
};

export const loadXAIConfig = async () => {
  const { xai } = await import('@ai-sdk/xai');
  return xai;
};

// Model loader utility
export async function getModelConfig(modelId: string) {
  switch (true) {
    case modelId.startsWith('gpt-') || modelId.startsWith('o1-'):
      const openai = await loadOpenAIConfig();
      return openai(modelId);
      
    case modelId.startsWith('claude-'):
      const anthropic = await loadAnthropicConfig();
      return anthropic(modelId);
      
    case modelId.startsWith('gemini-'):
      const google = await loadGoogleConfig();
      return google(modelId);
      
    case modelId.startsWith('grok-'):
      const xai = await loadXAIConfig();
      return xai(modelId);
      
    default:
      // Fallback to OpenAI
      const defaultAI = await loadOpenAIConfig();
      return defaultAI('gpt-4o');
  }
}

// Preload specific model SDK
export function preloadModelSDK(modelId: string): void {
  if (modelId.startsWith('gpt-') || modelId.startsWith('o1-')) {
    loadOpenAIConfig().catch(console.error);
  } else if (modelId.startsWith('claude-')) {
    loadAnthropicConfig().catch(console.error);
  } else if (modelId.startsWith('gemini-')) {
    loadGoogleConfig().catch(console.error);
  } else if (modelId.startsWith('grok-')) {
    loadXAIConfig().catch(console.error);
  }
} 