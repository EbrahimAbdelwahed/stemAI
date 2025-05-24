# OCR Implementation Test Guide

This document provides comprehensive testing instructions for the newly implemented GPT-4o OCR functionality in the STEM AI Assistant.

## 🧪 Test Overview

The OCR implementation includes:
- ✅ Enhanced OCR tool with Sharp image optimization
- ✅ OCR API route (`/api/ocr`)
- ✅ Enhanced FileUploader supporting images
- ✅ Updated chat page with image processing
- ✅ OCR Result display component
- ✅ Tool integration in chat API

## 📋 Pre-Test Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify Sharp Installation
Sharp should be installed automatically. Verify with:
```bash
node -e "console.log(require('sharp'))"
```

### 3. Environment Variables
Ensure you have the required OpenAI API key in `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```

## 🔍 Test Cases

### Test 1: Image File Upload Validation

**Objective**: Verify file type and size validation

**Steps**:
1. Navigate to `/chat`
2. Try uploading various file types:
   - ✅ Valid: JPG, PNG, GIF, BMP, WebP
   - ❌ Invalid: PDF, TXT, MP4, etc.
3. Try uploading large files (>10MB)

**Expected Results**:
- Valid image files should be accepted
- Invalid file types should show error message
- Large files should be rejected with size limit error

### Test 2: OCR API Direct Testing

**Objective**: Test the OCR API endpoint directly

**Steps**:
1. Use a tool like Postman or curl
2. POST to `/api/ocr` with a test image
3. Check response format

**Example curl command**:
```bash
curl -X POST http://localhost:3000/api/ocr \
  -F "file=@test_image.jpg"
```

**Expected Response**:
```json
{
  "success": true,
  "extractedText": "...",
  "hasFormulas": false,
  "confidence": 0.9,
  "processingTime": 1234,
  "originalSize": "150.2KB",
  "optimizedSize": "89.7KB",
  "message": "Successfully extracted text from \"test_image.jpg\""
}
```

### Test 3: Image Optimization

**Objective**: Verify Sharp image optimization works

**Steps**:
1. Upload a large, high-resolution image (>2MB)
2. Check console logs for optimization messages
3. Verify response includes size reduction info

**Expected Results**:
- Console should show: `[ocrTool] Using Sharp for image optimization`
- Response should show size reduction: `originalSize` > `optimizedSize`
- Images should be converted to JPEG format

### Test 4: OCR Text Extraction

**Objective**: Test OCR accuracy with different content types

**Test Images**:
1. **Plain Text Document**: Screenshot of typed text
2. **Handwritten Notes**: Photo of handwritten text
3. **Mathematical Formulas**: Image with equations
4. **Mixed Content**: Text + formulas + diagrams

**Steps**:
1. Upload each test image type
2. Verify extracted text accuracy
3. Check formula detection (`hasFormulas` flag)
4. Verify LaTeX formatting for math

**Expected Results**:
- Plain text should be extracted accurately
- Mathematical formulas should be detected and formatted in LaTeX
- Processing time should be reasonable (<10 seconds)

### Test 5: Chat Integration

**Objective**: Test OCR integration in chat flow

**Steps**:
1. Upload an image in the chat interface
2. Verify OCR results appear as assistant message
3. Ask follow-up questions about the extracted text
4. Test multiple image uploads

**Expected Results**:
- OCR results should appear immediately after upload
- Results should be formatted with proper styling
- Follow-up questions should reference the extracted text
- Multiple images should be processed sequentially

### Test 6: Tool Integration

**Objective**: Test OCR as an AI tool

**Steps**:
1. Ask the AI to "extract text from this image" while uploading
2. Request specific OCR tasks: "What formulas are in this image?"
3. Test tool calling through chat API

**Expected Results**:
- AI should use the `performOCR` tool automatically
- Tool results should render with OCRResult component
- Error handling should work gracefully

### Test 7: Error Handling

**Objective**: Test error scenarios

**Test Cases**:
1. Upload corrupted image file
2. Upload extremely large file
3. Network interruption during processing
4. Invalid API key

**Expected Results**:
- Graceful error messages for users
- Proper error logging in console
- No application crashes
- Retry functionality where appropriate

### Test 8: Performance Testing

**Objective**: Verify performance optimizations

**Metrics to Check**:
- Image optimization time
- OCR processing time
- Cache hit rates
- Memory usage

**Steps**:
1. Upload same image multiple times (test caching)
2. Upload various image sizes
3. Monitor browser dev tools performance

**Expected Results**:
- Second upload of same image should be faster (cache hit)
- Large images should be optimized before processing
- Memory usage should be reasonable

## 🐛 Common Issues & Troubleshooting

### Issue 1: Sharp Not Working
**Symptoms**: Images not optimized, fallback message in logs
**Solution**: 
```bash
npm rebuild sharp
# or
npm uninstall sharp && npm install sharp
```

### Issue 2: OCR Tool Not Available
**Symptoms**: Tool not found in chat API
**Solution**: Verify tool is exported in `visualization_tools.ts`

### Issue 3: TypeScript Errors
**Symptoms**: Build failures, type mismatches
**Solution**: Check Message type compatibility in chat page

### Issue 4: Large Images Failing
**Symptoms**: Timeout or memory errors
**Solution**: Verify image size limits and Sharp configuration

## 📊 Performance Benchmarks

### Expected Performance Metrics:
- **Small images** (< 500KB): 2-4 seconds
- **Medium images** (500KB - 2MB): 4-8 seconds  
- **Large images** (2MB - 10MB): 6-12 seconds
- **Cache hits**: < 1 second
- **Image optimization**: 50-80% size reduction

### Cost Optimization:
- Images resized to max 1024x1024
- JPEG compression at 85% quality
- 24-hour caching reduces API calls
- Expected cost: $0.003-$0.025 per image

## ✅ Test Completion Checklist

- [ ] File upload validation works
- [ ] OCR API responds correctly
- [ ] Image optimization functions
- [ ] Text extraction is accurate
- [ ] Formula detection works
- [ ] Chat integration seamless
- [ ] Tool calling functional
- [ ] Error handling robust
- [ ] Performance acceptable
- [ ] Caching operational

## 🚀 Next Steps After Testing

1. **Monitor Usage**: Track OCR usage patterns and costs
2. **Optimize Further**: Fine-tune image preprocessing
3. **Add Features**: Custom prompts, batch processing
4. **Documentation**: Update user guides
5. **Analytics**: Implement usage tracking

## 📝 Test Results Template

```markdown
## Test Results - [Date]

### Environment:
- Node.js version: 
- Browser: 
- Image test set: 

### Results:
- [ ] All basic functionality working
- [ ] Performance within acceptable range
- [ ] Error handling appropriate
- [ ] Cost optimization effective

### Issues Found:
1. [Issue description]
   - Severity: High/Medium/Low
   - Status: Open/Fixed
   - Notes: 

### Recommendations:
1. [Recommendation]
2. [Recommendation]
```

---

**Note**: This test guide should be executed in a development environment first, then staging, before any production deployment. 