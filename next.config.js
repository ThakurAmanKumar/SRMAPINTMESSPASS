/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  
  // Ensure MongoDB and Nodemailer work in serverless functions
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'nodemailer'],
  },
}

module.exports = nextConfig
