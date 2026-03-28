# Agent / AI context (serva)

Brief orientation for anyone (human or tool) working in this repo. For Cursor, see also `.cursor/rules/`.

## Product

**Serva** — restaurant / store operations (scheduling, sales reports, roles, cashflow, etc.).

## Stack

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Prisma** 6 with **MongoDB** (`DATABASE_URL`)
- **pnpm** (see `package.json` `pnpm.onlyBuiltDependencies`)
- **Tailwind** 4, **shadcn/ui**, **Zod**, **react-hook-form**
- Auth/session models and multi-tenant concepts live in `libs/database/prisma/schema.prisma`

## Apps

| App | Package | Port (dev) | Description |
| --- | ------- | ---------- | ----------- |
| Web | `@serva/web` (`apps/web`) | 3000 | Main app — scheduling, sales, reports, admin |
| Auth | `@serva/auth-app` (`apps/auth`) | 3001 | Centralized auth portal — login, signup, password reset, company selection, invites |

In production, these run on subdomains (e.g. `app.serva.com`, `auth.serva.com`) with shared cookies via `COOKIE_DOMAIN`.

## Commands

| Task                   | Command                                         |
| ---------------------- | ----------------------------------------------- |
| Dev server (Turbopack) | `pnpm dev` (web only) or `pnpm dev:all` (all)   |
| Production build       | `pnpm build`                                    |
| ESLint                 | `pnpm lint`                                     |
| React Email preview    | `pnpm email`                                    |
| Prisma client          | `pnpm --filter @serva/database run db:generate` |

`postinstall` runs `pnpm --filter @serva/database run db:generate` (Prisma client output is under `libs/database/generated/prisma/`, gitignored). Seed entry: `libs/database/prisma/seed.ts`. Extra seeds/scripts may live under `scripts/`.

Do **not** paste real secrets into rules or this file; use env var **names** only (e.g. `DATABASE_URL`).

## Layout

| Area | Package / Path |
| ---- | -------------- |
| Web app routes | `apps/web/src/app/` — route groups `(main)`, `(admin)` |
| Auth app routes | `apps/auth/src/app/` — login, signup, forgot-password, reset-password, select-company, invite |
| Database (Prisma, DAL) | `libs/database/` — `@serva/database` (schema, generated client, DAL queries in `src/dal/`) |
| Shared types, constants, utils, validations | `libs/shared/` — `@serva/shared` |
| Auth & session | `libs/auth/` — `@serva/auth` (session, authorize, permissions, cookies, password, rate-limiting) |
| UI (shadcn primitives) | `libs/ui/src/components/` — `@serva/ui` |
| UI (Serva custom components) | `libs/ui/src/components/serva/` — `@serva/ui` (app-designed components, icons registry in `constants/`) |
| Email templates | `libs/ui/src/components/emails/` — `@serva/ui/components/emails/*` |
| App-local lib | `apps/web/src/lib/` (validations, invite) |
| App-local components | `apps/web/src/components/` (app-sidebar, feature-specific) |

Prisma schema: `libs/database/prisma/schema.prisma`. DAL functions live in `libs/database/src/dal/` and are imported via `@serva/database`.

## Environment variables

| Variable | Description | Example (dev) | Example (prod) |
| -------- | ----------- | ------------- | -------------- |
| `AUTH_URL` | Auth app base URL | `http://localhost:3001` | `https://auth.serva.com` |
| `WEB_URL` | Web app base URL | `http://localhost:3000` | `https://app.serva.com` |
| `NEXT_PUBLIC_AUTH_URL` | Auth URL exposed to client components | same as `AUTH_URL` | same as `AUTH_URL` |
| `COOKIE_DOMAIN` | Shared cookie domain (omit for localhost) | _(unset)_ | `.serva.com` |
| `DATABASE_URL` | MongoDB connection string | _(in root .env)_ | _(in root .env)_ |

## Conventions

- Prefer **small, task-scoped changes**; avoid drive-by refactors unrelated to the request.
- **Database**: import DAL functions and Prisma model types from `@serva/database` instead of using `PrismaClient` directly in UI or route files.
- **Auth**: import session, authorize, and permission helpers from `@serva/auth` — not from scattered app files. Auth UI lives in `apps/auth`; consumer apps redirect to `AUTH_URL` for login/logout.
- **UI**: import shadcn primitives from `@serva/ui/components/<name>` and Serva custom components from `@serva/ui/components/serva/<name>`. The `cn` utility is at `@serva/ui/lib/utils`.
- **Server vs client**: server components by default; add `"use client"` only when needed (hooks, browser APIs, interactivity).
- Match **existing naming**, imports (`@serva/*` for libs, `@/…` for app-local), and component patterns in the nearest feature folder.

## Permissions / roles

Roles and permissions are seeded (see `scripts/seed-roles-and-permissions.ts`). When changing access control, update the data model, seeds, and any `authorize`/session checks (in `@serva/auth`) together.

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
