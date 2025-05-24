# Performance Optimization Test Suite

## Overview
This document provides test cases to validate the performance improvements implemented from the `snappier.md` optimization plan.

## Test Environment Setup

### Prerequisites
- STEM AI Assistant running locally
- Browser DevTools open (Performance tab)
- Network throttling disabled for baseline tests
- Clear browser cache before each test session

### Performance Metrics to Monitor
1. **Time to First Contentful Paint (FCP)**
2. **Time to Interactive (TTI)**
3. **Bundle Size** (check Network tab)
4. **Memory Usage** (check Memory tab)
5. **RAG Query Response Time**
6. **Markdown Rendering Time**

---

## Test Cases

### 🔹 **1. Bundle Splitting Validation**

#### Test 1.1: Check Bundle Chunks
**Steps**:
1. Open DevTools → Network tab
2. Refresh the application
3. Filter by JS files

**Expected Results**:
- [ ] `visualization-libs` chunk exists (contains plotly.js, 3dmol)
- [ ] `ai-libs` chunk exists (contains @ai-sdk packages)
- [ ] `markdown-libs` chunk exists (contains react-markdown, katex)
- [ ] Main bundle size is reduced compared to baseline
- [ ] Chunks load only when needed

#### Test 1.2: Lazy Loading Verification
**Steps**:
1. Load chat page (should not load visualization libs)
2. Ask for a molecule visualization
3. Monitor network requests

**Expected Results**:
- [ ] Visualization chunks load only when visualization is requested
- [ ] No unnecessary chunks loaded on initial page load

---

### 🔹 **2. RAG Caching Performance**

#### Test 2.1: Cache Hit Performance
**Query Sequence**:
1. "What is photosynthesis?" (first time)
2. "Tell me about photosynthesis" (similar query)
3. "Explain photosynthesis process" (similar query)

**Expected Results**:
- [ ] First query: Full RAG search (>100ms)
- [ ] Second query: Cache hit (<50ms)
- [ ] Third query: Cache hit (<50ms)
- [ ] Console shows "[RAG Cache] Direct hit" or "[RAG Cache] Similar query found"

#### Test 2.2: Simple Query Detection
**Query Sequence**:
1. "Hello" 
2. "Thanks"
3. "What is 2+2?"
4. "How do I calculate derivatives?"

**Expected Results**:
- [ ] Queries 1-3: No RAG search performed
- [ ] Query 4: RAG search performed (contains "calculate")
- [ ] Console shows "Simple query detected - skipping RAG"

---

### 🔹 **3. Markdown Rendering Optimization**

#### Test 3.1: Streaming Message Caching
**Steps**:
1. Ask a question that generates a long response with math
2. Let the response complete
3. Scroll up and down to trigger re-renders

**Expected Results**:
- [ ] Complete message is cached after streaming finishes
- [ ] No re-rendering of completed message blocks
- [ ] Console shows "[Streaming Markdown] Using cached complete message"

#### Test 3.2: Block-Level Caching
**Steps**:
1. Ask for a response with multiple paragraphs and code blocks
2. Monitor rendering during streaming

**Expected Results**:
- [ ] Completed blocks are cached individually
- [ ] Only the streaming block re-renders
- [ ] Previous blocks remain stable

---

### 🔹 **4. Browser Cache Performance**

#### Test 4.1: Visualization Cache
**Steps**:
1. Display a molecule (e.g., "Show me caffeine")
2. Navigate away and back
3. Request the same molecule again

**Expected Results**:
- [ ] Second request loads faster
- [ ] Console shows "[Browser Cache] Hit for key"
- [ ] No redundant network requests

---

### 🔹 **5. Memory Usage Optimization**

#### Test 5.1: Memory Leak Prevention
**Steps**:
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Generate 10 different visualizations
4. Take another heap snapshot
5. Compare memory usage

**Expected Results**:
- [ ] Memory usage doesn't grow excessively
- [ ] Cache eviction works properly
- [ ] No significant memory leaks detected

---

### 🔹 **6. Overall Performance Comparison**

#### Test 6.1: Before/After Metrics
**Baseline Measurements** (without optimizations):
- Initial page load: ___ms
- First visualization: ___ms
- RAG query response: ___ms
- Markdown rendering: ___ms

**Optimized Measurements** (with optimizations):
- Initial page load: ___ms
- First visualization: ___ms
- RAG query response: ___ms
- Markdown rendering: ___ms

**Expected Improvements**:
- [ ] 30%+ reduction in initial page load time
- [ ] 50%+ reduction in RAG query response time (cached)
- [ ] 40%+ reduction in markdown re-rendering time
- [ ] Smaller bundle sizes for initial load

---

## Performance Monitoring Commands

### Check Bundle Analysis
```bash
# Build and analyze bundle
npm run build
npx @next/bundle-analyzer
```

### Monitor Cache Statistics
```javascript
// In browser console
console.log('RAG Cache Stats:', window.ragCacheStats?.());
console.log('Markdown Cache Stats:', window.markdownCacheStats?.());
```

### Memory Usage Check
```javascript
// In browser console
console.log('Memory Usage:', performance.memory);
```

---

## Troubleshooting

### Common Issues
1. **Cache not working**: Check console for cache hit/miss logs
2. **Bundle not splitting**: Verify next.config.js webpack configuration
3. **Memory leaks**: Use DevTools Memory tab to identify retained objects

### Debug Commands
```javascript
// Clear all caches
window.clearAllCaches?.();

// Force cache statistics
window.debugCacheStats?.();
```

---

## Success Criteria

✅ **Optimization is successful if**:
- Bundle splitting reduces initial load by 30%+
- RAG caching improves repeat query performance by 50%+
- Markdown rendering optimizations reduce re-renders by 40%+
- Memory usage remains stable during extended use
- No functionality is broken or degraded

❌ **Optimization needs revision if**:
- Performance improvements are less than 20%
- New bugs or regressions are introduced
- Memory usage increases significantly
- User experience is negatively impacted 