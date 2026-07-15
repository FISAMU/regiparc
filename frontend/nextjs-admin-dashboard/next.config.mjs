/** @type {import("next").NextConfig} */
const nextConfig = {
  // Sur Vercel : pas de standalone. Ailleurs (build local) : standalone optionnel.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  devIndicators: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: ""
      }
    ]
  }
};

export default nextConfig;
