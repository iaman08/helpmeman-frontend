import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow hot module replacement (HMR) from the user's local network IP
  allowedDevOrigins: ['192.168.1.4', '192.168.1.12'],
};

export default nextConfig;
