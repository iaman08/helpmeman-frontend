import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow hot module replacement (HMR) from the user's local network IP
  allowedDevOrigins: ['192.168.1.2'],
};

export default nextConfig;
