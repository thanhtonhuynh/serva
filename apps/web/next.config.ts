import { resolve } from "node:path";
import type { NextConfig } from "next";
import packageJson from "./package.json" with { type: "json" };

const workspacePackages = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
})
  .filter(([, v]) => v.startsWith("workspace:"))
  .map(([name]) => name);

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(import.meta.dirname, "../../"),
  outputFileTracingIncludes: {
    "/*": [
      "./libs/database/generated/prisma/**/*",
      "./node_modules/.pnpm/@prisma+engines*/**/*",
    ],
  },
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: workspacePackages,
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;
