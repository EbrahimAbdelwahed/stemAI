# 🔍 GPT-4o OCR Implementation Guide for STEM AI Assistant

This document provides a comprehensive step-by-step guide for implementing Optical Character Recognition (OCR) functionality using GPT-4o vision capabilities in the STEM AI Assistant project.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Implementation Status](#implementation-status)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Testing & Verification](#testing--verification)
5. [Cost Optimization](#cost-optimization)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Design Philosophy
Following the proven **tool-first architecture** established in `docs/tool_viz.md`, the OCR implementation uses:

- ✅ **Direct Tool → Component pattern** - No complex wrapper chains
- ✅ **Vercel AI SDK tools** - Seamless integration with existing chat API
- ✅ **Global caching system** - Prevents redundant processing
- ✅ **Error boundaries** - Graceful error handling
- ✅ **Cost optimization** - Image preprocessing and intelligent caching

### System Flow
```
User uploads image → FileUploader → OCR API → OCR Tool → GPT-4o Vision → OCR Result Component
```

### Key Components
| Component | Purpose | Location |
|-----------|---------|----------|
| OCR Tool | GPT-4o vision integration | `lib/ai/tools/ocrTool.ts` |
| OCR API Route | Image processing endpoint | `app/api/ocr/route.ts` |
| Enhanced FileUploader | Image + document upload | `components/FileUploader.tsx` |
| OCR Result Component | Display extracted text | `components/OCRResult.tsx` |
| Tool Integration | Chat API integration | `app/api/chat/visualization_tools.ts` |

---

## ✅ Implementation Status

### Phase 1: Backend Infrastructure ✅ COMPLETED
- [x] OCR Tool implementation (`lib/ai/tools/ocrTool.ts`)
- [x] Tool follows established patterns from `tool_viz.md`
- [x] AI SDK integration with `generateText`
- [x] Caching system for cost optimization
- [x] Error handling and logging

### Phase 2: API & File Upload 🚧 IN PROGRESS
- [ ] OCR API route (`app/api/ocr/route.ts`)
- [ ] Enhanced FileUploader for images
- [ ] Image preprocessing (resize, base64 conversion)

### Phase 3: Frontend Integration 🔄 PENDING
- [ ] OCR Result display component
- [ ] Tool integration in chat API
- [ ] Chat message rendering for OCR results

---

## 🛠️ Step-by-Step Implementation

### Step 1: Create OCR API Route

Create `app/api/ocr/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ocrTool } from '../../../lib/ai/tools/ocrTool';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a valid image file.' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    console.log('[OCR API] Processing file:', file.name, file.type, `${(file.size / 1024).toFixed(1)}KB`);

    // Execute OCR using the tool
    const result = await ocrTool.execute({
      imageData: base64Data,
      mimeType: file.type,
      prompt: 'Extract all visible text and math formulas from the image. Format math using LaTeX. Keep the text readable and well structured.',
      includeStructure: true,
      mathFormat: 'latex'
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.errorMessage || 'OCR processing failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      extractedText: result.extractedText,
      hasFormulas: result.hasFormulas,
      confidence: result.confidence,
      processingTime: result.processingTime,
      message: `Successfully extracted text from "${file.name}"`
    });

  } catch (error: any) {
    console.error('[OCR API] Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
```

### Step 2: Enhance FileUploader Component

Update `components/FileUploader.tsx` to support images:

```typescript
// Update the accept prop and file type validation
const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
const DOCUMENT_TYPES = ['.pdf', '.txt', '.doc', '.docx'];
const ALL_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES];

// In the component:
<input
  type="file"
  ref={fileInputRef}
  className="hidden"
  onChange={handleFileInputChange}
  multiple
  accept={ALL_TYPES.join(',')}
  disabled={isUploading || disabled}
/>

// Update the display text:
<span className="text-xs ml-2 text-gray-400">
  (Images: JPG, PNG, GIF | Documents: PDF, TXT, DOC, DOCX)
</span>

// Add file type detection:
const isImageFile = (fileName: string): boolean => {
  const extension = '.' + fileName.split('.').pop()?.toLowerCase();
  return IMAGE_TYPES.includes(extension);
};

// Update the file icon function to include image icons
```

### Step 3: Update Chat Page for Image Processing

Modify `app/chat/page.tsx` to handle image uploads:

```typescript
const handleFileUpload = async (files: File[]) => {
  if (files.length === 0) return;
  
  setIsUploading(true);
  
  for (const file of files) {
    const isImage = file.type.startsWith('image/');
    const endpoint = isImage ? '/api/ocr' : '/api/documents';
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (isImage) {
          // Add OCR result to chat
          append({
            id: uuidv4(),
            role: 'assistant',
            content: `📸 **OCR Results from "${file.name}":**\n\n${result.extractedText}${result.hasFormulas ? '\n\n*✨ Mathematical formulas detected and formatted in LaTeX*' : ''}`,
            parts: [{
              type: 'text', 
              text: `📸 **OCR Results from "${file.name}":**\n\n${result.extractedText}${result.hasFormulas ? '\n\n*✨ Mathematical formulas detected and formatted in LaTeX*' : ''}`
            }]
          });
        } else {
          // Handle documents as before
          // ... existing document handling code
        }
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast.error(`Processing failed: ${error.message}`);
    }
  }
  
  setIsUploading(false);
};
```

### Step 4: Add OCR Tool to Chat API

Update `app/api/chat/visualization_tools.ts` to include OCR tool:

```typescript
import { ocrTool } from '../../../lib/ai/tools/ocrTool';

// Add OCR display tool
export const performOCR = tool({
  description: 'Extract text and mathematical formulas from images using GPT-4o vision. Use this when users request OCR, text extraction from images, or want to process screenshots/photos of documents.',
  parameters: ocrTool.parameters,
  execute: async (params) => {
    try {
      console.log('[visualization_tools] performOCR execute called with:', params);
      
      const result = await ocrTool.execute(params);
      
      if (result.error) {
        return {
          error: true,
          errorMessage: result.errorMessage || 'OCR processing failed',
          details: { mimeType: params.mimeType }
        };
      }
      
      return {
        extractedText: result.extractedText,
        hasFormulas: result.hasFormulas,
        confidence: result.confidence,
        processingTime: result.processingTime,
        description: `OCR extracted ${result.extractedText.length} characters${result.hasFormulas ? ' including mathematical formulas' : ''}`
      };
    } catch (e: any) {
      console.error(`[visualization_tools] Error in performOCR execute:`, e);
      return { 
        error: true, 
        errorMessage: `Failed to perform OCR: ${e.message}`,
        details: { mimeType: params.mimeType }
      };
    }
  },
});

// Add to exports
export const visualizationTools = {
  displayMolecule3D,
  plotFunction2D,
  plotFunction3D,
  displayPlotlyChart,
  displayPhysicsSimulation,
  performOCR,  // Add OCR tool
};
```

### Step 5: Create OCR Result Component

Create `components/OCRResult.tsx`:

```typescript
import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface OCRResultProps {
  extractedText: string;
  hasFormulas?: boolean;
  confidence?: number;
  processingTime?: number;
  description?: string;
}

const OCRResult: React.FC<OCRResultProps> = ({ 
  extractedText, 
  hasFormulas, 
  confidence, 
  processingTime,
  description 
}) => {
  return (
    <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
      <div className="flex items-center mb-2">
        <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
          OCR Results
        </h3>
        {confidence && (
          <span className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">{description}</p>
      )}
      
      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
        <MarkdownRenderer content={extractedText} />
      </div>
      
      {(hasFormulas || processingTime) && (
        <div className="mt-3 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
          <div className="flex items-center space-x-4">
            {hasFormulas && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Mathematical formulas detected
              </span>
            )}
          </div>
          {processingTime && (
            <span>Processed in {processingTime}ms</span>
          )}
        </div>
      )}
    </div>
  );
};

export default OCRResult;
```

### Step 6: Integrate OCR in Chat Messages

Update `components/ChatMessages.tsx` to render OCR results:

```typescript
// Add import
import OCRResult from './OCRResult';

// In the tool invocation rendering section:
{toolInvocation.state === 'result' && toolInvocation.toolName === 'performOCR' && (
  <OCRResult {...toolInvocation.result} />
)}
```

---

## 🧪 Testing & Verification

### Manual Testing Checklist

1. **File Upload Testing**
   - [ ] Upload various image formats (JPG, PNG, GIF, WebP)
   - [ ] Test file size limits (should reject >10MB)
   - [ ] Test invalid file types (should show error)

2. **OCR Functionality**
   - [ ] Upload image with plain text → verify extraction
   - [ ] Upload image with mathematical formulas → verify LaTeX formatting
   - [ ] Upload handwritten notes → verify readability
   - [ ] Upload screenshots → verify structure preservation

3. **Caching System**
   - [ ] Upload same image twice → second should be faster
   - [ ] Check console logs for cache hits

4. **Error Handling**
   - [ ] Upload corrupted image → verify graceful error
   - [ ] Upload very large file → verify size limit error
   - [ ] Network interruption → verify retry capability

### Sample Test Images

Create test images with:
- Typed text documents
- Handwritten mathematical equations
- Screenshots of code
- Mixed content (text + formulas + diagrams)

---

## 💰 Cost Optimization

### Image Preprocessing Strategy

```typescript
// Add to ocrTool.ts preprocessing function:
function optimizeImageForOCR(base64Data: string, mimeType: string): string {
  // Future enhancement: Add actual image resizing
  // For now, images are processed as-is
  // Recommended: Resize to max 1024x1024 for cost efficiency
  
  // Could add Canvas API or sharp library for server-side resizing:
  /*
  import sharp from 'sharp';
  
  const buffer = Buffer.from(base64Data, 'base64');
  const optimized = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  
  return `data:image/jpeg;base64,${optimized.toString('base64')}`;
  */
  
  return `data:${mimeType};base64,${base64Data}`;
}
```

### Cost Estimates (Per Image)
| Image Size | Estimated Cost |
|------------|----------------|
| 512×512    | $0.003-$0.006  |
| 1024×1024  | $0.006-$0.013  |
| 2048×2048  | $0.015-$0.025  |

### Caching Benefits
- **24-hour cache duration** prevents reprocessing
- **Hash-based deduplication** saves on identical images
- **~90% cost reduction** for repeated uploads

---

## 🔧 Troubleshooting

### Common Issues

1. **"Property 'completions' does not exist" Error**
   - ✅ **Fixed**: Use AI SDK's `generateText` instead of raw OpenAI SDK
   - Check imports in `ocrTool.ts`

2. **Image Not Processing**
   - Verify file type in `validTypes` array
   - Check file size limits (10MB max)
   - Ensure base64 encoding is correct

3. **Low OCR Accuracy**
   - Try adjusting the prompt in `ocrTool.ts`
   - Consider image preprocessing (contrast, resolution)
   - Use higher detail setting in future updates

4. **Tool Not Available in Chat**
   - Verify tool is exported in `visualization_tools.ts`
   - Check system prompt includes OCR instructions
   - Ensure proper tool registration

### Debug Logging

Enable detailed logging in development:

```typescript
// Add to ocrTool.ts
console.log('[ocrTool] Input image size:', params.imageData.length);
console.log('[ocrTool] Cache status:', cached ? 'HIT' : 'MISS');
console.log('[ocrTool] Processing time:', processingTime + 'ms');
```

---

## 🚀 Next Steps

### Phase 4: Advanced Features (Future)
- [ ] **Image preprocessing**: Sharp library integration for resizing
- [ ] **Batch OCR**: Process multiple images simultaneously
- [ ] **OCR confidence scoring**: Enhanced accuracy metrics
- [ ] **Custom prompts**: User-configurable OCR instructions
- [ ] **Language detection**: Multi-language OCR support

### Integration with Existing Features
- [ ] **RAG System**: Index OCR results for document search
- [ ] **Formula Rendering**: Enhanced LaTeX display with KaTeX
- [ ] **Export Options**: Save OCR results as markdown/PDF

---

This implementation guide provides a complete roadmap for adding GPT-4o OCR functionality to the STEM AI Assistant while following established architectural patterns and best practices. The modular approach ensures seamless integration with existing features and maintains code quality standards.


