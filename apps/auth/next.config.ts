import type { NextConfig } from "next";
import { resolve } from "node:path";
import packageJson from "./package.json" with { type: "json" };

const workspacePackages = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
})
  .filter(([, v]) => v.startsWith("workspace:"))
  .map(([name]) => name);

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(import.meta.dirname, "../../"),
  // Keys are matched against normalized route paths; `/**` covers nested routes.
  // Include generated client + query engines (copied here by `prisma generate`).
  // Do not trace `node_modules/.pnpm/**` — pnpm symlinks break Vercel serverless packaging.
  outputFileTracingIncludes: {
    "/**": ["../../libs/database/generated/prisma/**/*"],
  },
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: workspacePackages,
  reactStrictMode: false,
};

export default nextConfig;
