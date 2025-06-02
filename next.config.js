/** @type {import('next').NextConfig} */
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
        require.resolve('./lib/pdf-parse-clean.js')
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
      // Use lighter alternatives where possible
      'react-dom$': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    };

    // Optimize client-side bundles
    if (!isServer) {
      // Enhanced code splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // Heavy visualization libraries
          visualization: {
            test: /[\\/]node_modules[\\/](plotly\.js|3dmol|@rdkit|molstar)[\\/]/,
            name: 'visualization-libs',
            chunks: 'async', // Load only when needed
            enforce: true,
            priority: 30,
          },
          // AI/ML libraries
          ai: {
            test: /[\\/]node_modules[\\/](@ai-sdk|ai|openai|anthropic)[\\/]/,
            name: 'ai-libs',
            chunks: 'all',
            enforce: true,
            priority: 25,
          },
          // Markdown and text processing
          markdown: {
            test: /[\\/]node_modules[\\/](react-markdown|remark|rehype|katex|prismjs)[\\/]/,
            name: 'markdown-libs',
            chunks: 'all',
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
          // React ecosystem
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-libs',
            chunks: 'all',
            enforce: true,
            priority: 10,
          },
          // Common vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 5,
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

module.exports = nextConfig; 