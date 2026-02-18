/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the most common reason for "Page isn't working" in Codespaces
  async headers() {
    return [
      {
        source: "/api/auth/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev" },
        ],
      },
    ];
  },
  transpilePackages: ["@kinderz/db"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
        "localhost:3000"
      ],
    },
  },
};

export default nextConfig;