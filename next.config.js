/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@ai-sdk/react', 'react-markdown', 'plotly.js'],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize client-side bundles
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          visualization: {
            test: /[\\/]node_modules[\\/](plotly\.js|3dmol|@rdkit)[\\/]/,
            name: 'visualization-libs',
            chunks: 'all',
            enforce: true,
          },
          ai: {
            test: /[\\/]node_modules[\\/](@ai-sdk|ai)[\\/]/,
            name: 'ai-libs',
            chunks: 'all',
            enforce: true,
          },
          markdown: {
            test: /[\\/]node_modules[\\/](react-markdown|remark|rehype|katex)[\\/]/,
            name: 'markdown-libs',
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

module.exports = nextConfig; 