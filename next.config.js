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
}

module.exports = nextConfig
