/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['api.agora.io', 'nextjs.org'],
    },
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    webpack: (config) => {
      config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/fonts/[name][ext]',
        },
      });
      return config;
    },
  }
  
  export default nextConfig;