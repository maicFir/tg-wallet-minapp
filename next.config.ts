import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    'wagmi',
    'viem',
    '@walletconnect/ethereum-provider',
    '@walletconnect/modal',
    '@walletconnect/universal-provider',
    'pino-pretty'
  ],
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  allowedDevOrigins: [
    'reload-homeless-warehouse-snake.trycloudflare.com',
    '*.trycloudflare.com',
    'localhost:3000'
  ],
  turbopack: {},
};

export default nextConfig;
