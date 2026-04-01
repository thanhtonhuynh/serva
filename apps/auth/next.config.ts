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
  // Keys are matched against normalized route paths; `/**` covers nested routes.
  // Note: `outputFileTracingIncludes` is only applied when using Webpack for production
  // build (`next build --webpack`). Turbopack builds omit buildTraceContext, so these
  // globs are ignored and Prisma's native engine would be missing on Vercel.
  outputFileTracingIncludes: {
    "/**": [
      "./libs/database/generated/prisma/**/*",
      "./node_modules/.pnpm/@prisma+engines*/**/*",
    ],
  },
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: workspacePackages,
  reactStrictMode: false,
};

export default nextConfig;
