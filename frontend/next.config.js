/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api-inconnu-vps.onrender.com'}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api-inconnu-vps.onrender.com'}/auth/:path*`,
      },
    ];
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'files.catbox.moe'],
    unoptimized: true // Pour Render
  },
  trailingSlash: true,
}

module.exports = nextConfig
