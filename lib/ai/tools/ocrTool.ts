import { z } from 'zod';
import { tool } from 'ai';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// OCR Tool Schema following the established pattern
export const ocrToolSchema = z.object({
  imageData: z.string().describe('Base64-encoded image data (without data:image/... prefix)'),
  mimeType: z.string().describe('MIME type of the image (e.g., image/jpeg, image/png)'),
  prompt: z.string().optional().default('Extract all visible text and math formulas from the image. Format math using LaTeX. Keep the text readable and well structured.').describe('Custom prompt for OCR extraction'),
  includeStructure: z.boolean().optional().default(true).describe('Whether to preserve document structure in the output'),
  mathFormat: z.enum(['latex', 'mathml', 'plain']).optional().default('latex').describe('Format for mathematical expressions'),
});

// OCR Result interface
interface OCRResult {
  extractedText: string;
  confidence?: number;
  hasFormulas?: boolean;
  processingTime?: number;
  originalSize?: string;
  optimizedSize?: string;
  error?: boolean;
  errorMessage?: string;
}

// Simple hash function for caching
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Global cache for OCR results
const ocrCache = new Map<string, { result: OCRResult; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Enhanced image preprocessing function with actual resizing
async function preprocessImageForOCR(base64Data: string, mimeType: string): Promise<{ 
  dataUrl: string; 
  originalSize: string; 
  optimizedSize: string; 
}> {
  try {
    // Convert base64 to buffer
    const inputBuffer = Buffer.from(base64Data, 'base64');
    const originalSize = `${(inputBuffer.length / 1024).toFixed(1)}KB`;

    // Try to import sharp for server-side image optimization
    let optimizedBuffer: Buffer;
    let optimizedSize: string;
    
    try {
      // Dynamic import of sharp (only if available)
      const sharp = await import('sharp');
      
      console.log('[ocrTool] Using Sharp for image optimization');
      
      // Optimize image: resize to max 1024x1024, convert to JPEG with 85% quality
      optimizedBuffer = await sharp.default(inputBuffer)
        .resize(1024, 1024, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();
      
      optimizedSize = `${(optimizedBuffer.length / 1024).toFixed(1)}KB`;
      
      // Use optimized JPEG format
      const optimizedBase64 = optimizedBuffer.toString('base64');
      return {
        dataUrl: `data:image/jpeg;base64,${optimizedBase64}`,
        originalSize,
        optimizedSize
      };
      
    } catch {
      console.log('[ocrTool] Sharp not available, using Canvas API fallback');
      
      // Fallback to browser Canvas API simulation for basic resizing
      // This is a simplified version - in a real browser environment, 
      // you'd use actual Canvas API
      optimizedBuffer = inputBuffer;
      optimizedSize = originalSize;
      
      return {
        dataUrl: `data:${mimeType};base64,${base64Data}`,
        originalSize,
        optimizedSize: optimizedSize + ' (not optimized)'
      };
    }
    
  } catch (error) {
    console.warn('[ocrTool] Image preprocessing failed, using original:', error);
    return {
      dataUrl: `data:${mimeType};base64,${base64Data}`,
      originalSize: 'unknown',
      optimizedSize: 'unknown'
    };
  }
}

// Clean old cache entries
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of ocrCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      ocrCache.delete(key);
    }
  }
}

// OCR execution function
async function executeOCR(params: z.infer<typeof ocrToolSchema>): Promise<OCRResult> {
  const startTime = Date.now();
  
  try {
    // Create cache key
    const cacheKey = simpleHash(`${params.imageData.substring(0, 100)}:${params.prompt}:${params.mathFormat}`);
    
    // Clean old cache entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean cache
      cleanCache();
    }
    
    // Check cache first
    const cached = ocrCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[ocrTool] Returning cached OCR result');
      return {
        ...cached.result,
        processingTime: Date.now() - startTime,
      };
    }

    // Preprocess and optimize image
    const { dataUrl: imageUrl, originalSize, optimizedSize } = await preprocessImageForOCR(params.imageData, params.mimeType);

    // Enhanced prompt based on parameters
    let enhancedPrompt = params.prompt;
    if (params.includeStructure) {
      enhancedPrompt += ' Preserve the document structure including headings, paragraphs, and lists.';
    }
    if (params.mathFormat === 'latex') {
      enhancedPrompt += ' Format all mathematical expressions using LaTeX notation with $ for inline math and $$ for display math.';
    } else if (params.mathFormat === 'mathml') {
      enhancedPrompt += ' Format mathematical expressions using MathML notation.';
    }

    console.log('[ocrTool] Processing OCR request with GPT-4o vision', { originalSize, optimizedSize });

    // Call GPT-4o with vision capabilities using AI SDK
    const result = await generateText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: enhancedPrompt,
            },
            {
              type: 'image',
              image: imageUrl,
            },
          ],
        },
      ],
      maxTokens: 2000, // Reasonable limit for OCR text
      temperature: 0.1, // Low temperature for consistent OCR results
    });

    const extractedText = result.text || '';
    
    if (!extractedText.trim()) {
      throw new Error('No text was extracted from the image');
    }

    // Detect if formulas are present (simple heuristic)
    const hasFormulas = /\$[^$]+\$|\$\$[^$]+\$\$|\\[a-zA-Z]+\{.*?\}/.test(extractedText);

    const ocrResult: OCRResult = {
      extractedText: extractedText.trim(),
      hasFormulas,
      processingTime: Date.now() - startTime,
      confidence: 0.9, // GPT-4o generally has high confidence
      originalSize,
      optimizedSize,
    };

    // Cache the result
    ocrCache.set(cacheKey, {
      result: ocrResult,
      timestamp: Date.now(),
    });

    console.log('[ocrTool] OCR completed successfully', { 
      textLength: extractedText.length, 
      hasFormulas,
      processingTime: ocrResult.processingTime 
    });
    return ocrResult;

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[ocrTool] Error in executeOCR:', errorMessage);
    return {
      error: true,
      errorMessage: `OCR processing failed: ${errorMessage}`,
      extractedText: '',
      hasFormulas: false,
      confidence: 0,
      processingTime: Date.now() - startTime
    };
  }
}

// Export the OCR tool following the established pattern
export const ocrTool = tool({
  description: 'Extract text and mathematical formulas from images using GPT-4o vision capabilities. Use this when users upload images containing text, handwritten notes, equations, documents, or screenshots that need text extraction.',
  parameters: ocrToolSchema,
  execute: executeOCR,
});

// Export the execute function for direct API use
export { executeOCR };

// Default export for consistency
export default ocrTool; 