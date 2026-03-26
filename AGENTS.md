# Agent / AI context (serva)

Brief orientation for anyone (human or tool) working in this repo. For Cursor, see also `.cursor/rules/`.

## Product

**Serva** — restaurant / store operations (scheduling, sales reports, roles, cashflow, etc.).

## Stack

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Prisma** 6 with **MongoDB** (`DATABASE_URL`)
- **pnpm** (see `package.json` `pnpm.onlyBuiltDependencies`)
- **Tailwind** 4, **Zod**, **react-hook-form**
- Auth/session models and multi-tenant concepts live in `prisma/schema.prisma`

## Commands

| Task                   | Command                     |
| ---------------------- | --------------------------- |
| Dev server (Turbopack) | `pnpm dev`                  |
| Production build       | `pnpm build`                |
| ESLint                 | `pnpm lint`                 |
| React Email preview    | `pnpm email`                |
| Prisma client          | `pnpm exec prisma generate` |

`postinstall` runs `prisma generate` and `prisma db seed`. Seed entry: `prisma/seed.ts`. Extra seeds/scripts may live under `scripts/`.

Do **not** paste real secrets into rules or this file; use env var **names** only (e.g. `DATABASE_URL`).

## Layout

| Area                                         | Path                                                            |
| -------------------------------------------- | --------------------------------------------------------------- |
| App Router routes                            | `src/app/` — route groups include `(auth)`, `(main)`, `(admin)` |
| DB access helpers                            | `src/data-access/`                                              |
| Shared libs (Prisma singleton, auth helpers) | `src/lib/`                                                      |
| UI primitives & shared components            | `src/components/`                                               |

Prisma schema and migrations: `prisma/`.

## Conventions

- Prefer **small, task-scoped changes**; avoid drive-by refactors unrelated to the request.
- **Database**: use `src/data-access/` (and `src/lib/prisma.ts`) instead of sprinkling `PrismaClient` in UI or route files.
- **Server vs client**: server components by default; add `"use client"` only when needed (hooks, browser APIs, interactivity).
- Match **existing naming**, imports (`@/…`), and component patterns in the nearest feature folder.

## Permissions / roles

Roles and permissions are seeded (see `scripts/seed-roles-and-permissions.ts`). When changing access control, update the data model, seeds, and any `authorize`/session checks together.


<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->