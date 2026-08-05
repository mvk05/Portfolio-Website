/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Portfolio-Website' : '',
  images: { unoptimized: true },
};

module.exports = nextConfig;
