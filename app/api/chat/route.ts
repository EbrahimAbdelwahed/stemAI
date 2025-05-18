import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { searchDocuments } from '../../../lib/ai/documents';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { messages, model = 'grok-3-mini', mode = 'chat' } = await req.json();
  
  // Get the last user message to use for RAG
  const lastUserMessage = messages
    .filter((message: any) => message.role === 'user')
    .pop();
  
  // Initialize context with empty string
  let context = '';
  
  // If there's a user message, search for relevant documents
  if (lastUserMessage) {
    try {
      const relevantDocs = await searchDocuments(lastUserMessage.content, 3);
      if (relevantDocs && relevantDocs.length > 0) {
        // Format the relevant documents into a context string
        context = `Here is some relevant information that may help answer the question:\n\n` +
          relevantDocs.map((doc) => {
            return `Document: "${doc.title}"\nContent: ${doc.content}\n`;
          }).join('\n');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      // Continue without context if search fails
    }
  }

  const modelConfig = getModelConfig(model, mode);
  
  // Add context to the system message if available
  const system = context 
    ? `${modelConfig.system}\n\n${context}` 
    : modelConfig.system;
  
  const result = streamText({
    model: modelConfig.model,
    system,
    messages,
    maxSteps: 5,
    tools: mode === 'generate' ? {
      generateReactComponent: {
        description: 'Generate a React component based on the user request',
        parameters: z.object({
          jsx: z.string().describe('The React JSX code for the component'),
          componentName: z.string().describe('The name of the component'),
          description: z.string().describe('A brief description of what the component does'),
        }),
        execute: async function ({ jsx, componentName, description }) {
          // In a real implementation, you might want to format or validate the JSX
          return {
            jsx,
            componentName,
            description,
            timestamp: new Date().toISOString()
          };
        }
      }
    } : undefined
  });

  return result.toDataStreamResponse();
}

function getModelConfig(modelId: string, mode: string = 'chat') {
  // Base system message for the mode
  const baseSystem = mode === 'generate' 
    ? `You are an expert React developer who excels at creating clean, accessible, and responsive UI components. You're helping a user create React components based on their prompts. Always generate the most minimal, clean React code that fulfills the requirements. Use TypeScript type annotations when appropriate. Always use modern React patterns (e.g., functional components, hooks). Format the JSX beautifully.

When generating code, invoke the 'generateReactComponent' tool to provide the complete, ready-to-use component. Each component should be:
1. Complete and self-contained
2. Well-typed with TypeScript
3. Using modern React patterns
4. Following best practices for accessibility and responsiveness`
    : `You are a helpful STEM assistant. Focus on providing accurate, educational information about science, technology, engineering, and mathematics. Explain concepts clearly and provide examples where appropriate. If you're unsure about something, acknowledge the limits of your knowledge instead of making up information.`;

  switch (modelId) {
    case 'grok-3-mini':
      return {
        model: xai('grok-3-mini-beta'),
        system: mode === 'generate'
          ? `${baseSystem}\n\nYou are powered by Grok-3-Mini with reasoning capabilities.`
          : `${baseSystem}\n\nYou are powered by Grok-3-Mini with reasoning capabilities.`,
      };
    case 'gemini-2-flask':
      return {
        model: google('gemini-2.0-flash-exp'),
        system: mode === 'generate'
          ? `${baseSystem}\n\nYou are powered by Gemini 2.0 Flask.`
          : `${baseSystem}\n\nYou are powered by Gemini 2.0 Flask.`,
      };
    default:
      // Fallback to OpenAI if the requested model is not available
      return {
        model: openai('gpt-4o'), 
        system: mode === 'generate'
          ? `${baseSystem}\n\nYou are powered by GPT-4o.`
          : `${baseSystem}\n\nYou are powered by GPT-4o.`,
      };
  }
} 