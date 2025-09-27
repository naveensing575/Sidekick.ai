import withPWA from 'next-pwa'

const isDev = process.env.NODE_ENV === 'development'

const baseConfig = {
  reactStrictMode: true,
}

const nextConfig = withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
})(baseConfig)

export default nextConfig