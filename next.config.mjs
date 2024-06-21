/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['media.giphy.com'],
      },
      module: {
        rules: [
          {
            test: /\.mp3$/,
            use: {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'audios/'
              }
            }
          }
        ]
      }
};

export default nextConfig;


 

 
 