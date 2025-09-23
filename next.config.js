/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false, // Use Pages Router
  },
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Ensure Vercel recognizes this as a Next.js project
  output: 'standalone',
  // Disable static optimization for API routes
  trailingSlash: false,
}

module.exports = nextConfig
