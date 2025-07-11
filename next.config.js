/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable image optimization completely to stop errors
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  }
};

export default nextConfig;
