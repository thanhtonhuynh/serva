import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(rootDir, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
