import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { streamText, CoreMessage } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { searchDocumentsOptimized, detectSimpleQuery } from '../../../lib/ai/optimized-documents';
import { visualizationTools } from './visualization_tools';
import { trackAPIPerformanceDetailed } from '../../../lib/analytics/api-performance-middleware';
import { auth } from '@/auth';
import { 
  createConversation, 
  saveMessage, 
  generateConversationTitle,
  getConversationById,
  saveToolInvocation
} from '@/lib/db/conversations';
import { saveToLocalStorage } from '@/lib/chat/migration';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// getModelConfig will now be the primary way to get a configured model instance
function getModelConfig(modelId: string, mode: string = 'chat') {
  let baseSystem = '';

  if (mode === 'generate') {
    baseSystem = `You are an expert React developer who excels at creating clean, accessible, and responsive UI components. You're helping a user create React components based on their prompts. Always generate the most minimal, clean React code that fulfills the requirements. Use TypeScript type annotations when appropriate. Always use modern React patterns (e.g., functional components, hooks). Format the JSX beautifully.\r\n\r\nWhen generating code, invoke the 'generateReactComponent' tool to provide the complete, ready-to-use component. Each component should be:\r\n1. Complete and self-contained\r\n2. Well-typed with TypeScript\r\n3. Using modern React patterns\r\n4. Following best practices for accessibility and responsiveness`;
  } else { // 'chat' mode
    baseSystem = `You are a helpful STEM assistant. Focus on providing accurate, educational information about science, technology, engineering, and mathematics. Explain concepts clearly and provide examples where appropriate. If you're unsure about something, acknowledge the limits of your knowledge instead of making up information.

## CRITICAL: MATHEMATICAL FORMATTING REQUIREMENTS

**MANDATORY**: ALL mathematical expressions MUST use dollar sign delimiters - NEVER use parentheses or brackets!

WRONG: (f(x)), (\\frac{dy}{dx}), [ \\frac{dy}{dx} = f'(x) ]
CORRECT: $f(x)$, $\\frac{dy}{dx}$, $$\\frac{dy}{dx} = f'(x)$$

**INLINE MATH**: Use single dollar signs for math within sentences:
- Variables: Use $x$, $y$, $f(x)$, $g(x)$
- Simple expressions: Use $E = mc^2$, $F = ma$, $\\frac{dy}{dx}$
- Constants: Use $\\pi$, $e$, $\\alpha$, $\\beta$

**BLOCK MATH**: Use double dollar signs for standalone equations:
- Important formulas: Use $$\\frac{dy}{dx} = f'(g(x)) \\cdot g'(x)$$
- Complex expressions: Use $$\\int_a^b f(x) dx = F(b) - F(a)$$

**EXAMPLES OF CORRECT FORMATTING**:
The chain rule formula is $\\frac{dy}{dx} = \\frac{df}{dg} \\cdot \\frac{dg}{dx}$.
For a composite function $h(x) = f(g(x))$, we have: $$h'(x) = f'(g(x)) \\cdot g'(x)$$
Where $f'(g(x))$ is the derivative of the outer function and $g'(x)$ is the derivative of the inner function.

## TEXT FORMATTING GUIDELINES

### Mathematical Elements (Remember: Always use $ delimiters!)
- Fractions: $\frac{numerator}{denominator}$
- Square roots: $\sqrt{x}$, $\sqrt[n]{x}$
- Subscripts/superscripts: $x_1^2$, $H_2O$
- Integrals: $\int_a^b f(x) dx$
- Derivatives: $\frac{d}{dx}$, $\frac{\partial f}{\partial x}$
- Greek letters: $\alpha$, $\beta$, $\gamma$, $\Delta$, $\Omega$
- Functions: $\sin(x)$, $\cos(x)$, $\log(x)$, $\ln(x)$
- Chemistry: $\text{H}_2\text{SO}_4$, $\text{CaCO}_3$

### Content Structure
- Use clear headers (# ## ###) for organization
- Format lists with proper bullets or numbers
- Use code blocks with language specification
- Include tables when comparing data
- Use **bold** for key terms, *italics* for emphasis
- Define all mathematical variables when introduced
- Include units for physical quantities
- Break complex derivations into clear steps

**REMINDER**: Every single mathematical expression, variable, or formula MUST be wrapped in dollar signs!

When a user asks about molecules, chemical structures, or wants to see a 3D molecular visualization, you MUST call the 'displayMolecule3D' tool. Do NOT generate text tokens like [NEEDS_VISUALIZATION]. Instead, directly call the tool.

For molecule visualization:
- Tool name: displayMolecule3D
- Required parameters: identifierType ('pdb' or 'smiles'), identifier (the actual SMILES string or PDB ID)
- Optional: description

Example: If user asks about ethanol (CCO), call displayMolecule3D with:
{
  "identifierType": "smiles", 
  "identifier": "CCO", 
  "description": "3D model of Ethanol"
}

For physics simulations and mechanics demonstrations, use the 'displayPhysicsSimulation' tool:

PREDEFINED PHYSICS SCENARIOS:
- "collision_demo" - Demonstrates elastic/inelastic collisions with conservation of momentum
- "spring_system" - Shows simple harmonic motion and spring dynamics
- "projectile_motion" - Demonstrates parabolic trajectory under gravity
- "inclined_plane" - Forces and motion on angled surfaces
- "pendulum" - Simple pendulum with customizable parameters
- "falling_objects" - Objects falling under gravity with different properties

NATURAL LANGUAGE TO PHYSICS MAPPING:
- "Two balls colliding" or "collision" → collision_demo
- "Mass on a spring" or "harmonic motion" → spring_system  
- "Ball rolling down a ramp" → inclined_plane
- "Projectile" or "trajectory" → projectile_motion
- "Pendulum" or "oscillation" → pendulum
- "Falling" or "gravity" → falling_objects

For predefined scenarios, use minimal parameters:
{
  "simulationType": "collision_demo",
  "simConfig": {},
  "metadata": {
    "title": "Collision Demonstration",
    "description": "Watch two objects collide and observe momentum conservation"
  }
}

For custom physics scenarios, use the full configuration system:
{
  "simulationType": "custom_matter_js_setup",
  "simConfig": {
    "objects": [
      {
        "id": "ball1",
        "type": "ball",
        "position": {"x": 100, "y": 200},
        "velocity": {"x": 2, "y": 0},
        "dimensions": {"radius": 15},
        "properties": {"mass": 1, "color": "#ff6b6b"}
      }
    ],
    "environment": {
      "gravity": {"x": 0, "y": 0.98},
      "boundaries": {"ground": true, "walls": true}
    }
  },
  "metadata": {
    "title": "Custom Physics Simulation",
    "educational_context": "Demonstrates specific physics principles"
  }
}

Object types: "ball", "box", "polygon"
Colors: Use hex codes like "#ff6b6b", "#4ecdc4", "#9b59b6"
Always include educational_context in metadata to explain the physics concept.

For mathematical function plotting:
- For 2D functions (single variable): use 'plotFunction2D' tool
  * Required: functionString (math.js syntax), variable (name and range)
  * Optional: plotType ('line' or 'scatter'), title
  * Example: sin(x) from -π to π would be:
    {
      "functionString": "sin(x)",
      "variable": {"name": "x", "range": [-3.14159, 3.14159]},
      "plotType": "line",
      "title": "Sine Wave"
    }

- For 3D functions (two variables): use 'plotFunction3D' tool  
  * Required: functionString (math.js syntax), variables (array of 2 variables with names and ranges)
  * Optional: plotType ('surface' or 'contour'), title
  * Example: sin(x)*cos(y) would be:
    {
      "functionString": "sin(x) * cos(y)",
      "variables": [
        {"name": "x", "range": [-5, 5]},
        {"name": "y", "range": [-5, 5]}
      ],
      "plotType": "surface",
      "title": "3D Plot of sin(x)*cos(y)"
    }

For general charts and plots with raw data, use the 'displayPlotlyChart' tool with data array and optional layout object.

IMPORTANT: 
- Always use the actual tool calls, never generate text tokens or placeholders
- Call each tool only ONCE per response - do not repeat tool calls
- After calling a tool, provide a brief explanation of what was displayed
- For physics, always explain the educational concept being demonstrated
- CRITICAL: Use ONLY dollar signs for mathematical expressions - NEVER parentheses or brackets!
- Structure responses with clear headers, proper markdown formatting, and logical flow
- Use appropriate emphasis, lists, and code blocks to enhance readability`;
  }

  switch (modelId) {
    case 'gemini-1.5-flash-latest':
      return {
        model: google('models/gemini-1.5-flash-latest'),
        system: `${baseSystem}\n\nYou are powered by Gemini 1.5 Flash.`,
      };
    case 'claude-3-haiku-20240307':
      return {
        model: anthropic('claude-3-haiku-20240307'),
        system: `${baseSystem}\n\nYou are powered by Claude 3 Haiku.`,
      };
    case 'gpt-4o':
      return {
        model: openai('gpt-4o'),
        system: `${baseSystem}\n\nYou are powered by GPT-4o.`,
      };
    default:
      // For Grok models that don't support native tool calling, we use special tokens
      const grokSystem = baseSystem.replace(
        'Do NOT generate text tokens like [NEEDS_VISUALIZATION]. Instead, directly call the tool.',
        'Since you do not support native tool calling, you MUST use special text tokens for visualizations and tools.'
      );
      
      return {
        model: xai('grok-3-mini'),
        system: `${grokSystem}\n\nYou are powered by Grok-3-Mini with reasoning capabilities.

## SPECIAL TOKEN SYSTEM FOR VISUALIZATIONS

Since you do not support native function calling, use these special text tokens:

**For 3D Molecular Visualization:**
[NEEDS_VISUALIZATION:{"type":"molecule3D","identifier":"SMILES_OR_PDB_ID","identifierType":"smiles_or_pdb","description":"Brief description"}]

**For 2D Function Plotting:**
[NEEDS_VISUALIZATION:{"type":"plot2D","functionString":"sin(x)","variable":{"name":"x","range":[-3.14,3.14]},"title":"Plot Title"}]

**For 3D Function Plotting:**
[NEEDS_VISUALIZATION:{"type":"plot3D","functionString":"sin(x)*cos(y)","variables":[{"name":"x","range":[-5,5]},{"name":"y","range":[-5,5]}],"title":"3D Plot Title"}]

**For Physics Simulations:**
[NEEDS_VISUALIZATION:{"type":"physics","simulationType":"collision_demo","metadata":{"title":"Physics Demo","description":"Description"}}]

**For Custom Charts:**
[NEEDS_VISUALIZATION:{"type":"plotly","data":[{"x":[1,2,3],"y":[1,4,9],"type":"scatter"}],"title":"Chart Title"}]

IMPORTANT: Always use these exact token formats when users request visualizations, molecular structures, plots, or physics simulations. The system will automatically convert these tokens into interactive visualizations.`,
      };
  }
}

function errorHandler(error: unknown): string {
  if (error == null) {
    return 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  try {
    const strError = JSON.stringify(error);
    return strError.length > 200 ? strError.substring(0, 197) + '...' : strError;
  } catch {
    return 'Complex error object that could not be stringified';
  }
}

// Helper function for comprehensive tool signal extraction
function extractAllToolSignals(text: string): Array<{pattern: string, match: string, fullMatch: string}> {
  const signals = [];
  const patterns = [
    /\[NEEDS_VISUALIZATION:({.*?})\]/g,
    /displayMolecule3D\([^)]*\)/g,
    /plotFunction[23]D\([^)]*\)/g,
    /displayPlotlyChart\([^)]*\)/g,
    /displayPhysicsSimulation\([^)]*\)/g,
    /performOCR\([^)]*\)/g
  ];
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    signals.push(...matches.map(m => ({ 
      pattern: pattern.source, 
      match: m[0],
      fullMatch: m[1] || m[0] // Extract JSON content if available
    })));
  }
  
  return signals;
}

// Enhanced function to detect tool signals during streaming
function detectEarlyToolSignals(token: string) {
  const detectedSignals = [];
  
  // Pattern 1: [NEEDS_VISUALIZATION:{...}] format
  if (token.includes('[NEEDS_VISUALIZATION')) {
    const visualizationPattern = /\[NEEDS_VISUALIZATION:({.*?})\]/;
    const match = token.match(visualizationPattern);
    if (match) {
      try {
        const signal = JSON.parse(match[1]);
        detectedSignals.push({
          type: 'needs_visualization',
          signal,
          rawMatch: match[0]
        });
      } catch (err) {
        console.warn('[Early Tool Detection] Failed to parse NEEDS_VISUALIZATION signal:', err);
      }
    }
  }

  // Pattern 2: Direct tool function calls
  const toolPatterns = [
    { name: 'displayMolecule3D', pattern: /displayMolecule3D.*?identifier["\s]*:["\s]*([^"}\s,]+)/ },
    { name: 'plotFunction2D', pattern: /plotFunction2D.*?functionString["\s]*:["\s]*([^"}\s,]+)/ },
    { name: 'plotFunction3D', pattern: /plotFunction3D.*?functionString["\s]*:["\s]*([^"}\s,]+)/ },
    { name: 'displayPlotlyChart', pattern: /displayPlotlyChart/ },
    { name: 'displayPhysicsSimulation', pattern: /displayPhysicsSimulation.*?simulationType["\s]*:["\s]*([^"}\s,]+)/ },
    { name: 'performOCR', pattern: /performOCR/ }
  ];

  for (const { name, pattern } of toolPatterns) {
    if (pattern.test(token)) {
      const match = token.match(pattern);
      detectedSignals.push({
        type: 'tool_function_call',
        toolName: name,
        rawMatch: match ? match[0] : token,
        extractedParam: match && match[1] ? match[1] : undefined
      });
    }
  }

  return detectedSignals;
}

async function chatHandler(req: NextRequest): Promise<Response> {
  const body = await req.json();
  
  // Add debugging to understand the request structure
  console.log('[Chat API] Raw request body keys:', Object.keys(body));
  console.log('[Chat API] Raw request body:', JSON.stringify(body, null, 2));
  
  const { 
    messages, 
    model: modelId = 'grok-3-mini',
    mode = 'chat',
    conversationId,
  }: { 
    messages: CoreMessage[], 
    model?: string, 
    mode?: 'chat' | 'generate',
    conversationId?: string,
  } = body;

  // Add validation for messages
  if (!messages) {
    console.error('[Chat API] Messages is undefined or null:', messages);
    return new Response(JSON.stringify({ 
      error: 'Messages array is required but was not provided' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!Array.isArray(messages)) {
    console.error('[Chat API] Messages is not an array:', typeof messages, messages);
    return new Response(JSON.stringify({ 
      error: 'Messages must be an array' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (messages.length === 0) {
    console.error('[Chat API] Messages array is empty');
    return new Response(JSON.stringify({ 
      error: 'Messages array cannot be empty' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log('[Chat API] Messages structure:', messages.map(m => ({ role: m.role, hasContent: !!m.content })));

  // Get authentication session
  const session = await auth();
  const userId = session?.user?.id;

  // Handle conversation persistence
  let currentConversationId = conversationId;
  let isNewConversation = false;

  // If we have a user and no conversation ID, create a new conversation
  if (userId && !currentConversationId && messages.length > 0) {
    try {
      // Convert CoreMessage to Message format for title generation
      const messagesForTitle = messages.map((msg, index) => ({
        id: `temp-${index}`,
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        createdAt: new Date()
      }));
      const title = generateConversationTitle(messagesForTitle as any);
      const conversation = await createConversation({
        userId,
        title,
        model: modelId
      });
      currentConversationId = conversation.id;
      isNewConversation = true;
      console.log('[Chat API] Created new conversation:', currentConversationId);
    } catch (error) {
      console.error('[Chat API] Failed to create conversation:', error);
      // Continue without persistence - will fall back to localStorage
    }
  }

  // If we have a conversation ID, verify access
  if (currentConversationId && userId) {
    try {
      const conversation = await getConversationById(currentConversationId, userId);
      if (!conversation) {
        console.warn('[Chat API] Conversation not found or access denied:', currentConversationId);
        currentConversationId = undefined;
      }
    } catch (error) {
      console.error('[Chat API] Error verifying conversation access:', error);
      currentConversationId = undefined;
    }
  }

  const lastUserMessage = messages
    .filter((message: CoreMessage) => message.role === 'user')
    .pop();
  
  let context = '';
  if (process.env.RAG_ENABLED === 'true' && lastUserMessage && typeof lastUserMessage.content === 'string') {
    try {
      // Fast path for simple queries (no RAG needed)
      const isSimpleQuery = detectSimpleQuery(lastUserMessage.content);
      
      if (!isSimpleQuery) {
        console.log('RAG is enabled, searching documents for:', lastUserMessage.content.substring(0, 50) + '...');
        const relevantDocs = await searchDocumentsOptimized(lastUserMessage.content, 3);
        if (relevantDocs && relevantDocs.length > 0) {
          context = `Here is some relevant information that may help answer the question:\n\n` +
            relevantDocs.map((doc) => {
              return `Document: \"${doc.title}\"\nContent: ${doc.content}\n`;
            }).join('\n');
        }
      } else {
        console.log('Simple query detected - skipping RAG for:', lastUserMessage.content.substring(0, 50) + '...');
      }
    } catch (error) {
      console.error('Error searching documents (RAG enabled):', error);
    }
  } else if (lastUserMessage && typeof lastUserMessage.content === 'string'){
    console.log('RAG is disabled or last user message is not suitable for search. Skipping document search.');
  }

  const modelConfig = getModelConfig(modelId, mode);
  
  const systemPromptWithContext = context 
    ? `${modelConfig.system}\n\n${context}`
    : modelConfig.system;

  console.log('[Chat API] ===== NEW REQUEST =====');
  console.log('[Chat API] Model:', modelId, 'Mode:', mode);
  console.log('[Chat API] Messages count:', messages.length);
  console.log('[Chat API] Last message:', messages[messages.length - 1]?.content?.toString().substring(0, 100));
  console.log('[Chat API] Available tools:', mode === 'chat' ? Object.keys(visualizationTools) : ['generateReactComponent']);
  console.log('[Chat API] System prompt includes:', systemPromptWithContext.includes('displayMolecule3D') ? 'displayMolecule3D instructions' : 'no tool instructions');

  try {
    const result = await streamText({
      model: modelConfig.model,
      system: systemPromptWithContext,
      messages: messages,
      maxSteps: mode === 'generate' ? 5 : 3,
      tools: mode === 'generate' ? { 
        generateReactComponent: {
          description: 'Generate a React component based on the user request',
          parameters: z.object({
            jsx: z.string().describe('The React JSX code for the component'),
            componentName: z.string().describe('The name of the component'),
            description: z.string().describe('A brief description of what the component does'),
          }),
          execute: async function ({ jsx, componentName, description }) {
            return { jsx, componentName, description, timestamp: new Date().toISOString() };
          }
        }
      } : visualizationTools,
      
      // NEW: Real-time chunk processing for early tool detection
      onChunk: async ({ chunk }) => {
        try {
          // Early tool signal detection during streaming
          if (chunk.type === 'text-delta' && chunk.textDelta) {
            const detectedSignals = detectEarlyToolSignals(chunk.textDelta);
            
            if (detectedSignals.length > 0) {
              console.log('[Enhanced Streaming] Early tool signals detected:', detectedSignals);
              // Note: Early detection for potential optimizations
              // The actual tool processing happens in onStepFinish and onFinish
            }
          }
          
          // Handle tool call streaming chunks
          if (chunk.type === 'tool-call-streaming-start') {
            console.log('[Enhanced Streaming] Tool call started:', chunk);
          }
          
          if (chunk.type === 'tool-call-delta') {
            console.log('[Enhanced Streaming] Tool call delta:', chunk);
          }
        } catch (err) {
          console.error('[Enhanced Streaming] Error in onChunk processing:', err);
        }
      },
      
      // ENHANCED: Step completion handling for multi-step flows
      onStepFinish: async ({ stepType, finishReason, usage, text, toolCalls, toolResults }) => {
        console.log('[Enhanced onStepFinish] Step completed:', {
          stepType,
          finishReason,
          usage,
          toolCallsCount: toolCalls?.length || 0,
          toolResultsCount: toolResults?.length || 0,
          textLength: text?.length || 0
        });
        
        if (toolCalls && toolCalls.length > 0) {
          console.log('[Enhanced onStepFinish] Tool calls in this step:', toolCalls.length, 'calls');
        }
      },
      
      // ENHANCED: Final completion handling
      onFinish: async ({ text, toolCalls, toolResults, finishReason, usage, steps }) => {
        try {
          console.log('[Enhanced onFinish] ===== STREAM FINISHED =====');
          console.log('[Enhanced onFinish] Finish Reason:', finishReason);
          console.log('[Enhanced onFinish] Usage:', usage);
          console.log('[Enhanced onFinish] Text:', text?.substring(0, 200) + (text?.length > 200 ? '...' : ''));
          console.log('[Enhanced onFinish] Tool Calls Count:', toolCalls?.length || 0);
          console.log('[Enhanced onFinish] Steps Count:', steps?.length || 0);
          
          // Save conversation to database if authenticated
          if (currentConversationId && userId && text) {
            try {
              // Save the user's last message first (if not already saved)
              const lastUserMsg = messages[messages.length - 1];
              if (lastUserMsg && lastUserMsg.role === 'user') {
                await saveMessage({
                  conversationId: currentConversationId,
                  role: 'user',
                  content: typeof lastUserMsg.content === 'string' ? lastUserMsg.content : JSON.stringify(lastUserMsg.content),
                  parts: Array.isArray(lastUserMsg.content) ? lastUserMsg.content : undefined,
                  metadata: { timestamp: new Date().toISOString() }
                });
              }

              // Save the assistant's response
              const assistantMessage = await saveMessage({
                conversationId: currentConversationId,
                role: 'assistant',
                content: text,
                tokenUsage: usage,
                metadata: { 
                  finishReason,
                  stepCount: steps?.length,
                  timestamp: new Date().toISOString()
                }
              });

              // Save tool invocations if any
              if (toolCalls && toolCalls.length > 0 && assistantMessage) {
                for (let i = 0; i < toolCalls.length; i++) {
                  const toolCall = toolCalls[i] as any;
                  const toolResult = toolResults?.[i] as any;
                  
                  await saveToolInvocation({
                    messageId: assistantMessage.id,
                    toolName: toolCall.toolName || toolCall.name || 'unknown',
                    parameters: toolCall.args || toolCall.parameters,
                    result: toolResult?.result,
                    executionTime: toolResult?.executionTime
                  });
                }
              }

              console.log('[Enhanced onFinish] Saved conversation to database:', currentConversationId);
            } catch (dbError) {
              console.error('[Enhanced onFinish] Error saving to database:', dbError);
              // Fall back to localStorage for anonymous users
              if (!userId) {
                try {
                  const allMessages = [...messages, { 
                    id: `msg-${Date.now()}`, 
                    role: 'assistant', 
                    content: text,
                    createdAt: new Date()
                  }];
                  saveToLocalStorage(currentConversationId || `chat-${Date.now()}`, allMessages as any);
                  console.log('[Enhanced onFinish] Saved to localStorage as fallback');
                } catch (lsError) {
                  console.error('[Enhanced onFinish] Error saving to localStorage:', lsError);
                }
              }
            }
          }
          
          // Process completed tool calls
          if (toolCalls && toolCalls.length > 0) {
            console.log('[Enhanced onFinish] Processing tool calls:', JSON.stringify(toolCalls, null, 2));
          }
          
          if (toolResults && toolResults.length > 0) {
            console.log('[Enhanced onFinish] Tool Results:', JSON.stringify(toolResults, null, 2));
          }
          
          // Final text processing for any missed signals
          if (text) {
            const finalSignals = extractAllToolSignals(text);
            if (finalSignals.length > 0) {
              console.log('[Enhanced onFinish] Final tool signals found:', finalSignals);
            }
          }
          
          console.log('[Enhanced onFinish] Available Tools:', Object.keys(visualizationTools));
        } catch (error) {
          console.error('[Enhanced onFinish] Error in enhanced onFinish:', error);
        }
      }
    });

    const response = result.toDataStreamResponse({ 
      getErrorMessage: errorHandler 
    });

    // Add conversation ID to response headers if available
    if (currentConversationId) {
      response.headers.set('X-Conversation-Id', currentConversationId);
    }
    if (isNewConversation) {
      response.headers.set('X-New-Conversation', 'true');
    }

    return response;

  } catch (error) {
    console.error('Error in enhanced streamText call:', error);
    
    const message = errorHandler(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Export the wrapped handler with performance tracking
export const POST = trackAPIPerformanceDetailed(chatHandler); 