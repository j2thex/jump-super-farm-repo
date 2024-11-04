/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true
  },
  reactStrictMode: true,
  transpilePackages: ['styled-components']
};

module.exports = nextConfig; 