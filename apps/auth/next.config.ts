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
  transpilePackages: workspacePackages,
  reactStrictMode: false,
};

export default nextConfig;
