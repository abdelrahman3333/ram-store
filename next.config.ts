import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'onykqwxkcjpviqlgdmtk.supabase.co',
      },
    ],
  },
};

export default nextConfig;
