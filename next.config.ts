import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel performs its own output tracing. Standalone output is retained for
  // the Docker image, but enabling it on Vercel breaks Next.js 16 post-build
  // processing because Vercel expects the regular server trace manifest.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://127.0.0.1:8000 http://localhost:8000 https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
    ] }];
  },
};

export default nextConfig;
