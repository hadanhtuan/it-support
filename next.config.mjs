/** @type {import('next').NextConfig} */
const nextConfig = {
  // Other Next.js configurations...

  pageExtensions: ['ts', 'tsx'],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
  },

};

export default nextConfig;