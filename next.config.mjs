/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['media.giphy.com'],
      },
      webpack(config) {
        config.module.rules.push({
          test: /\.(mp3|wav)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              publicPath: `/_next/static/files`,
              outputPath: 'static/files',
            },
          },
        });
    
        return config;
      },
};

export default nextConfig;


 

 
 