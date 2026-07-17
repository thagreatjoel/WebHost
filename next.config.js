/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
    unoptimized: false,
  },
  // Remove the 'output: export' line
}

module.exports = nextConfig