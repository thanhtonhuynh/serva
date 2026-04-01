import type { NextConfig } from "next";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import packageJson from "./package.json" with { type: "json" };

const require = createRequire(import.meta.url);
const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin") as {
  PrismaPlugin: new () => { apply: (compiler: unknown) => void };
};

const workspacePackages = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
})
  .filter(([, v]) => v.startsWith("workspace:"))
  .map(([name]) => name);

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(import.meta.dirname, "../../"),
  // Keys are matched against normalized route paths; `/**` covers nested routes.
  // Include generated client + engines. Avoid tracing `.pnpm/**` (symlinks break Vercel deploy).
  // Production build uses Webpack (`next build --webpack`) so PrismaPlugin can copy engines into output.
  outputFileTracingIncludes: {
    "/**": ["../../libs/database/generated/prisma/**/*"],
  },
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: workspacePackages,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins ??= [];
      config.plugins.push(new PrismaPlugin());
    }
    return config;
  },
  reactStrictMode: false,
};

export default nextConfig;
