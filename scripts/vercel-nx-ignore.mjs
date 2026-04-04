#!/usr/bin/env node
/**
 * Vercel "Ignored Build Step" helper for Nx 21+ monorepos.
 *
 * Replaces `npx nx-ignore <project>` which breaks when root package.json lists
 * Nx as a semver range (e.g. ^21.3.2): nx-ignore parses that as major 0 and calls
 * the removed `nx affected:graph` command.
 *
 * Vercel semantics: exit 0 = skip/cancel build, exit 1 = continue with build.
 *
 * Usage (Vercel project settings → Ignored Build Step → Custom):
 *   node scripts/vercel-nx-ignore.mjs auth-portal
 *
 * Optional: VERCEL_GIT_PREVIOUS_SHA / CACHED_COMMIT_REF are used as --base when set.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const project = process.argv[2];
if (!project) {
  console.error("Usage: node scripts/vercel-nx-ignore.mjs <nx-project-name>");
  process.exit(1);
}

const root = fileURLToPath(new URL("..", import.meta.url));

function commitMessage() {
  try {
    return execSync("git log -1 --pretty=%B", { cwd: root, encoding: "utf8" });
  } catch {
    return "";
  }
}

const msg = commitMessage();
if (
  ["[skip ci]", "[ci skip]", "[no ci]", "[nx skip]", `[nx skip ${project}]`].some((s) =>
    msg.includes(s),
  )
) {
  console.log("Skip build: commit message requests skip.");
  process.exit(0);
}
if (["[nx deploy]", `[nx deploy ${project}]`].some((s) => msg.includes(s))) {
  console.log("Continue build: commit message forces deploy.");
  process.exit(1);
}

process.env.NX_DAEMON = "false";

let base = process.env.VERCEL_GIT_PREVIOUS_SHA || process.env.CACHED_COMMIT_REF || "HEAD^";
try {
  execSync(`git show ${base}`, { cwd: root, stdio: "pipe" });
} catch {
  base = "HEAD^";
}

const nxBin = join(root, "node_modules", ".bin", "nx");
const nxCmd = existsSync(nxBin) ? `"${nxBin}"` : "npx nx";

let affected = [];
try {
  const out = execSync(`${nxCmd} show projects --affected --json --base=${base} --head=HEAD`, {
    cwd: root,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, NX_DAEMON: "false" },
  });
  const lastLine = out.trim().split("\n").at(-1) ?? "[]";
  affected = JSON.parse(lastLine);
} catch (e) {
  console.error("nx show projects --affected failed; continuing build to be safe.");
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}

if (!Array.isArray(affected)) {
  console.error("Unexpected nx output; continuing build.");
  process.exit(1);
}

if (affected.includes(project)) {
  console.log(`Continue build: ${project} is affected (base=${base}).`);
  process.exit(1);
}

console.log(`Skip build: ${project} not affected (base=${base}).`);
process.exit(0);
