import withPWA from 'next-pwa'
import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

const baseConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {}, 
  },
}

const nextConfig = withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
})(baseConfig)

export default nextConfig
