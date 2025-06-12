# Task 04: Implement Code Splitting and Bundle Optimization

## Priority: P1 (High Priority)

## Overview
The current bundle size is 1.41 MB with heavy dependencies like plotly.js, 3dmol, and multiple AI SDKs loaded eagerly. Implement proper code splitting and dynamic imports to reduce initial bundle size and improve loading performance.

## Root Cause Analysis
- All visualization libraries loaded eagerly regardless of usage
- AI SDK dependencies bundled together without splitting
- No lazy loading for heavy components
- Missing opportunities for route-based code splitting

## Target Metrics
- **Current**: 1.41 MB initial bundle
- **Target**: < 800 KB initial bundle (43% reduction)
- **Expected**: 40-60% improvement in initial load time

## Implementation Steps

### Step 1: Analyze Current Bundle
```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Update next.config.js to enable analysis
ANALYZE=true npm run build
```

### Step 2: Create Lazy Loading Utility
Create `lib/lazy-loading/index.ts`:

```typescript
import { lazy, ComponentType, LazyExoticComponent, Suspense } from 'react';

// Generic loading skeleton
export const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-800 rounded ${className}`}>
    <div className="h-32 bg-gray-700 rounded"></div>
  </div>
);

// Visualization loading skeleton
export const VisualizationSkeleton = () => (
  <div className="w-full h-96 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading visualization...</div>
  </div>
);

// Chart loading skeleton
export const ChartSkeleton = () => (
  <div className="w-full h-64 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading chart...</div>
  </div>
);

// Create lazy component with custom loading
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  LoadingComponent: ComponentType = LoadingSkeleton
): LazyExoticComponent<T> {
  const LazyComponent = lazy(importFn);
  
  return lazy(() => 
    Promise.resolve({ 
      default: (props: any) => (
        <Suspense fallback={<LoadingComponent />}>
          <LazyComponent {...props} />
        </Suspense>
      )
    })
  ) as LazyExoticComponent<T>;
}

// Preload component for better UX
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): void {
  // Preload on requestIdleCallback or setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch(console.error);
    });
  } else {
    setTimeout(() => {
      importFn().catch(console.error);
    }, 1000);
  }
}
```

### Step 3: Implement Visualization Code Splitting
Create `components/visualizations/LazyComponents.tsx`:

```typescript
import { lazy, Suspense } from 'react';
import { VisualizationSkeleton, ChartSkeleton } from '@/lib/lazy-loading';

// Lazy load heavy visualization components
export const LazyPlotlyPlot = lazy(() => 
  import('react-plotly.js').then(module => ({
    default: module.default
  }))
);

export const LazyMolecule3DViewer = lazy(() => 
  import('./Molecule3DViewer').then(module => ({
    default: module.default
  }))
);

export const LazyPhysicsSimulation = lazy(() => 
  import('./PhysicsSimulation').then(module => ({
    default: module.default
  }))
);

export const LazyCodePreview = lazy(() => 
  import('../CodePreview').then(module => ({
    default: module.default
  }))
);

// Wrapper components with Suspense
export function PlotlyPlot(props: any) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <LazyPlotlyPlot {...props} />
    </Suspense>
  );
}

export function Molecule3DViewer(props: any) {
  return (
    <Suspense fallback={<VisualizationSkeleton />}>
      <LazyMolecule3DViewer {...props} />
    </Suspense>
  );
}

export function PhysicsSimulation(props: any) {
  return (
    <Suspense fallback={<VisualizationSkeleton />}>
      <LazyPhysicsSimulation {...props} />
    </Suspense>
  );
}

export function CodePreview(props: any) {
  return (
    <Suspense fallback={<LoadingSkeleton className="h-48" />}>
      <LazyCodePreview {...props} />
    </Suspense>
  );
}
```

### Step 4: Optimize AI SDK Imports
Create `lib/ai/lazy-models.ts`:

```typescript
import { lazy } from 'react';

// Lazy load AI model configurations
export const loadOpenAIConfig = () => 
  import('@ai-sdk/openai').then(module => module.openai);

export const loadAnthropicConfig = () => 
  import('@ai-sdk/anthropic').then(module => module.anthropic);

export const loadGoogleConfig = () => 
  import('@ai-sdk/google').then(module => module.google);

export const loadXAIConfig = () => 
  import('@ai-sdk/xai').then(module => module.xai);

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
```

### Step 5: Update Chat API to Use Lazy Loading
Update `app/api/chat/route.ts`:

```typescript
import { streamText, CoreMessage } from 'ai';
import { NextRequest } from 'next/server';
import { getModelConfig } from '@/lib/ai/lazy-models';

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();
    
    // Dynamically load the required AI model
    const modelConfig = await getModelConfig(model);
    
    const result = await streamText({
      model: modelConfig,
      messages,
      // ... rest of config
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
```

### Step 6: Implement Route-Based Code Splitting
Update key pages to use lazy loading:

**app/generate/page.tsx:**
```typescript
'use client';

import { Suspense, lazy } from 'react';
import { LoadingSkeleton } from '@/lib/lazy-loading';

// Lazy load generate-specific components
const LazyUIGenerator = lazy(() => import('./components/UIGenerator'));
const LazyCodePreview = lazy(() => import('../../components/CodePreview'));

export default function GeneratePage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingSkeleton className="h-screen" />}>
        <LazyUIGenerator />
      </Suspense>
      
      <Suspense fallback={<LoadingSkeleton className="h-96" />}>
        <LazyCodePreview />
      </Suspense>
    </div>
  );
}
```

**app/chat/page.tsx:**
```typescript
'use client';

import { Suspense, lazy } from 'react';
import { LoadingSkeleton } from '@/lib/lazy-loading';

// Lazy load chat-specific components
const LazyChatInterface = lazy(() => import('../../components/ChatMessages'));
const LazyFileUploader = lazy(() => import('../../components/FileUploader'));

export default function ChatPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingSkeleton className="h-64" />}>
        <LazyChatInterface />
      </Suspense>
      
      <Suspense fallback={<LoadingSkeleton className="h-32" />}>
        <LazyFileUploader />
      </Suspense>
    </div>
  );
}
```

### Step 7: Optimize Plotly.js Imports
Create `components/visualizations/OptimizedPlotly.tsx`:

```typescript
import { lazy, Suspense } from 'react';
import { ChartSkeleton } from '@/lib/lazy-loading';

// Only import specific Plotly components to reduce bundle size
const Plot = lazy(() => 
  import('react-plotly.js').then(module => {
    // Pre-configure Plotly to only load necessary components
    const Plotly = module.Plotly;
    
    // Only register required plot types
    Plotly.register([
      require('plotly.js/lib/scatter'),
      require('plotly.js/lib/bar'),
      require('plotly.js/lib/histogram'),
      require('plotly.js/lib/heatmap'),
      require('plotly.js/lib/surface'),
      require('plotly.js/lib/scatter3d'),
    ]);
    
    return { default: module.default };
  })
);

export function OptimizedPlotlyPlot(props: any) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <Plot {...props} />
    </Suspense>
  );
}
```

### Step 8: Update Next.js Configuration
Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Existing config...
  
  // Enhanced webpack configuration for better code splitting
  webpack: (config, { dev, isServer }) => {
    // Existing webpack config...
    
    // Optimize client-side bundles with better code splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000, // Reduced from 244000
        cacheGroups: {
          // Heavy visualization libraries - load only when needed
          plotly: {
            test: /[\\/]node_modules[\\/](plotly\.js|react-plotly\.js)[\\/]/,
            name: 'plotly',
            chunks: 'async',
            enforce: true,
            priority: 40,
          },
          
          // 3D molecular visualization
          molecular: {
            test: /[\\/]node_modules[\\/](3dmol|molstar)[\\/]/,
            name: 'molecular-viz',
            chunks: 'async',
            enforce: true,
            priority: 35,
          },
          
          // AI SDK packages
          ai: {
            test: /[\\/]node_modules[\\/](@ai-sdk)[\\/]/,
            name: 'ai-sdk',
            chunks: 'async',
            enforce: true,
            priority: 30,
          },
          
          // OpenAI specific
          openai: {
            test: /[\\/]node_modules[\\/](@ai-sdk\/openai|openai)[\\/]/,
            name: 'openai',
            chunks: 'async',
            enforce: true,
            priority: 28,
          },
          
          // Anthropic specific
          anthropic: {
            test: /[\\/]node_modules[\\/](@ai-sdk\/anthropic|anthropic)[\\/]/,
            name: 'anthropic',
            chunks: 'async',
            enforce: true,
            priority: 28,
          },
          
          // Google AI specific
          google: {
            test: /[\\/]node_modules[\\/](@ai-sdk\/google|@google-ai)[\\/]/,
            name: 'google-ai',
            chunks: 'async',
            enforce: true,
            priority: 28,
          },
          
          // Markdown and text processing
          markdown: {
            test: /[\\/]node_modules[\\/](react-markdown|remark|rehype|katex)[\\/]/,
            name: 'markdown',
            chunks: 'async',
            enforce: true,
            priority: 25,
          },
          
          // Core React - keep together
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            enforce: true,
            priority: 20,
          },
          
          // Common vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    return config;
  },
  
  // Enhanced experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      '@ai-sdk/react',
      'react-markdown',
      'lucide-react',
    ],
    
    // Enable modern bundling
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

module.exports = withBundleAnalyzer(nextConfig);
```

### Step 9: Implement Preloading Strategy
Create `lib/preloading/index.ts`:

```typescript
// Preload commonly used components
export function preloadCommonComponents() {
  // Preload visualization components when user hovers over related UI
  const preloadVisualizations = () => {
    import('../components/visualizations/LazyComponents');
  };
  
  // Preload AI models based on user's previous selections
  const preloadAIModels = (modelHistory: string[]) => {
    modelHistory.forEach(model => {
      if (model.startsWith('gpt-')) {
        import('@ai-sdk/openai');
      } else if (model.startsWith('claude-')) {
        import('@ai-sdk/anthropic');
      }
      // ... other models
    });
  };
  
  return {
    preloadVisualizations,
    preloadAIModels,
  };
}

// Smart preloading based on user behavior
export function useSmartPreloading() {
  const { preloadVisualizations, preloadAIModels } = preloadCommonComponents();
  
  // Preload when user hovers over visualization buttons
  const handleVisualizationHover = () => {
    preloadVisualizations();
  };
  
  // Preload based on current conversation context
  const preloadBasedOnContext = (conversationContent: string) => {
    if (conversationContent.includes('plot') || conversationContent.includes('chart')) {
      import('react-plotly.js');
    }
    
    if (conversationContent.includes('molecule') || conversationContent.includes('3D')) {
      import('../components/visualizations/Molecule3DViewer');
    }
  };
  
  return {
    handleVisualizationHover,
    preloadBasedOnContext,
  };
}
```

## Verification Steps

### 1. Bundle Analysis
```bash
# Run bundle analyzer
ANALYZE=true npm run build

# Check bundle sizes
npm run build | grep "First Load JS"
```

### 2. Performance Testing
- Measure initial page load time before/after
- Test lazy loading on slow connections
- Verify visualization components load correctly

### 3. User Experience Testing
- Test hover preloading effectiveness
- Verify smooth loading transitions
- Check for any broken functionality

## Expected Outcomes

### Bundle Size Improvements
- **Initial Bundle**: 1.41 MB → ~800 KB (43% reduction)
- **Plotly Chunk**: ~400 KB (loaded only when needed)
- **3DMol Chunk**: ~200 KB (loaded only when needed)
- **AI Model Chunks**: ~100 KB each (loaded per model)

### Performance Improvements
- **Initial Load Time**: 40-60% faster
- **Time to Interactive**: 30-50% faster
- **Perceived Performance**: Significantly better with skeleton loading

### User Experience
- ✅ Faster initial page loads
- ✅ Smooth loading transitions with skeletons
- ✅ Progressive enhancement for features
- ✅ Better mobile performance

## Success Criteria
- [ ] Initial bundle size reduced to < 800 KB
- [ ] Visualization components load only when needed
- [ ] No breaking changes in functionality
- [ ] Improved Core Web Vitals scores
- [ ] Smooth loading experience with proper skeletons

---

**Priority**: High - Critical for performance improvement
**Estimated Time**: 5-7 hours
**Dependencies**: Task 03 (Component simplification)
**Next Task**: Task 05 - Implement Error Boundaries
