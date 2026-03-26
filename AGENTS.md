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
