// next.config.mjs
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add support for MP3 files
    config.module.rules.push({
      test: /\.(mp3)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audios/', // Adjust the path as needed
          outputPath: 'static/audios/', // Adjust the path as needed
          name: '[name].[ext]',
          esModule: false,
        },
      },
    });

    return config;
  },

  images: {
    domains: ['media.giphy.com'],
  },
};

export default nextConfig;
