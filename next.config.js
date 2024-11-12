/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  // Desabilitar geração estática para rotas dinâmicas
  async headers() {
    return []
  },
  async rewrites() {
    return []
  }
}

module.exports = nextConfig 