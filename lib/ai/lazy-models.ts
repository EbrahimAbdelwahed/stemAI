// Lazy load AI model configurations
export const loadOpenRouterConfig = async () => {
  const { createOpenAI } = await import('@ai-sdk/openai');
  return createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });
};

export const loadDeepSeekConfig = async () => {
  const { deepseek } = await import('@ai-sdk/deepseek');
  return deepseek;
};

export const loadOpenAIConfig = async () => {
  const { openai } = await import('@ai-sdk/openai');
  return openai;
};

// Model loader utility
export async function getModelConfig(modelId: string) {
  switch (true) {
    case modelId.startsWith('gemini-'):
      const openrouter = await loadOpenRouterConfig();
      return openrouter(`google/${modelId}`);

    case modelId.startsWith('deepseek-'):
      const deepseek = await loadDeepSeekConfig();
      return deepseek(modelId);

    default:
      // Fallback to DeepSeek chat
      const defaultDS = await loadDeepSeekConfig();
      return defaultDS('deepseek-chat');
  }
}

// Preload specific model SDK
export function preloadModelSDK(modelId: string): void {
  if (modelId.startsWith('gemini-')) {
    loadOpenRouterConfig().catch(console.error);
  } else if (modelId.startsWith('deepseek-')) {
    loadDeepSeekConfig().catch(console.error);
  }
}
