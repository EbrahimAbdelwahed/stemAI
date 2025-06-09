/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  experimental: {
    optimizePackageImports: ['@ai-sdk/react', 'react-markdown', 'plotly.js'],
  },
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Enhanced webpack configuration
  webpack: (config, { dev, isServer }) => {
    // CRITICAL FIX: Replace pdf-parse index.js to avoid debug code execution
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^pdf-parse$/,
        require.resolve('./lib/pdf-parse-clean.ts')
      )
    );

    // CRITICAL: Exclude test files and directories from ALL modules
    config.module.rules.push({
      test: /node_modules.*\/test\/.*\.(js|ts|jsx|tsx|json|pdf)$/,
      use: 'ignore-loader',
    });
    
    config.module.rules.push({
      test: /node_modules.*\/tests\/.*\.(js|ts|jsx|tsx|json|pdf)$/,
      use: 'ignore-loader',
    });
    
    config.module.rules.push({
      test: /node_modules.*\/__tests__\/.*\.(js|ts|jsx|tsx|json|pdf)$/,
      use: 'ignore-loader',
    });
    
    config.module.rules.push({
      test: /node_modules.*\/spec\/.*\.(js|ts|jsx|tsx|json|pdf)$/,
      use: 'ignore-loader',
    });

    // Exclude test files and directories from build
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Optimize client-side bundles
    if (!isServer) {
      // Enhanced code splitting for optimal bundle sizes
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000, // Reduced from 244000 for better splitting
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
          
          // AI SDK packages - split by provider
          openai: {
            test: /[\\/]node_modules[\\/](@ai-sdk\/openai|openai)[\\/]/,
            name: 'openai',
            chunks: 'async',
            enforce: true,
            priority: 30,
          },
          
          anthropic: {
            test: /[\\/]node_modules[\\/](@ai-sdk\/anthropic|anthropic)[\\/]/,
            name: 'anthropic',
            chunks: 'async',
            enforce: true,
            priority: 30,
          },
          
          google: {
            test: /[\\/]node_modules[\\/](@ai-sdk\/google|@google-ai)[\\/]/,
            name: 'google-ai',
            chunks: 'async',
            enforce: true,
            priority: 30,
          },
          
          xai: {
            test: /[\\/]node_modules[\\/](@ai-sdk\/xai)[\\/]/,
            name: 'xai',
            chunks: 'async',
            enforce: true,
            priority: 30,
          },
          
          // Core AI SDK
          ai: {
            test: /[\\/]node_modules[\\/](ai|@ai-sdk\/react)[\\/]/,
            name: 'ai-core',
            chunks: 'all',
            enforce: true,
            priority: 25,
          },
          
          // Markdown and text processing
          markdown: {
            test: /[\\/]node_modules[\\/](react-markdown|remark|rehype|katex)[\\/]/,
            name: 'markdown',
            chunks: 'async',
            enforce: true,
            priority: 20,
          },
          
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion)[\\/]/,
            name: 'ui-libs',
            chunks: 'all',
            enforce: true,
            priority: 15,
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

      // Tree shaking optimizations - Fixed to avoid conflicts
      if (!dev) {
        config.optimization.usedExports = true;
        config.optimization.sideEffects = false;
        // Module concatenation for better performance
        config.optimization.concatenateModules = true;
      }
    }

    // Performance optimizations for large libraries
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        // Externalize heavy libraries that can be loaded via CDN
        '3dmol': '3Dmol',
        'plotly.js': 'Plotly',
      });
    }

    return config;
  },
  // Enhanced headers for performance
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
      ],
    },
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=300, s-maxage=600', // 5 min browser, 10 min CDN
        },
      ],
    },
  ],
  // Enable modern output
  output: 'standalone',
  // Enable React strict mode for better performance debugging
  reactStrictMode: true,
  // Power optimizations
  poweredByHeader: false,
};

module.exports = withBundleAnalyzer(nextConfig); 