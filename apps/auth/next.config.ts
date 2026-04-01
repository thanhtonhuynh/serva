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
  // Note: `outputFileTracingIncludes` is only applied when using Webpack for production
  // build (`next build --webpack`). Turbopack builds omit buildTraceContext, so these
  // globs are ignored and Prisma's native engine would be missing on Vercel.
  // Globs run with cwd = this app (`apps/auth`), not `outputFileTracingRoot`.
  outputFileTracingIncludes: {
    "/**": [
      "../../libs/database/generated/prisma/**/*",
      "../../node_modules/.pnpm/@prisma+engines*/**/*",
    ],
  },
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
