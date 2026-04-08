import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // ✅ Supabase storage
      {
        protocol: 'https',
        hostname: 'qblowiocpuvizchxiksx.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },

      // ✅ Localhost images (dev)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
