/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    config.externals.push({
      '@twa-dev/sdk': 'WebApp',
    });
    return config;
  },
};

module.exports = nextConfig; 