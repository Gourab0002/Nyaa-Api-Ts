import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the API URL to be configured via environment variable
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://nyaa-api-ts-63-fbs4nf88j6w0.nova420.deno.net",
  },
};

export default nextConfig;
