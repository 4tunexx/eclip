/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ["res.cloudinary.com"],
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    WS_URL: process.env.WS_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  },
};

module.exports = nextConfig;