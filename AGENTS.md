# Agent / AI context (serva)

Brief orientation for anyone (human or tool) working in this repo. For Cursor, see also `.cursor/rules/`.

## Product

**Serva** — restaurant / store operations (scheduling, sales reports, roles, cashflow, etc.).

## Stack

- **Monorepo**: **pnpm** workspaces (`pnpm-workspace.yaml`: `apps/*`, `libs/*`) + **Turborepo** (`turbo.json` at repo root) for task orchestration, caching, and pipelines.
- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Prisma** 6 with **MongoDB** (`DATABASE_URL`)
- **pnpm** (see `package.json` `pnpm.onlyBuiltDependencies`)
- **Tailwind** 4, **shadcn/ui** with BaseUI as primitives, **Zod** v4, **react-hook-form**
- Auth/session models and multi-tenant concepts live in `libs/database/prisma/schema.prisma`
- **Production**: each app is deployed separately on **Vercel** (see [Deployment](#deployment)); Turbo integrates with Vercel builds and remote caching when enabled.

## Apps

| App   | Package                            | Port (dev) | Description                                                                         |
| ----- | ---------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| Hub   | `serva-hub` (`apps/serva-hub`)     | 4100       | Main app — scheduling, sales, reports, tenant admin                                 |
| Auth  | `auth-portal` (`apps/auth-portal`) | 3100       | Centralized auth portal — login, signup, password reset, company selection, invites |
| Admin | `serva-admin` (`apps/serva-admin`) | 5100       | Platform super-admin (`isPlatformAdmin`)                                            |

In production, these run on subdomains (e.g. `app.serva.com`, `auth.serva.com`, `admin.serva.com`) with shared cookies via `COOKIE_DOMAIN`.
Note: `apps/serva-admin` is for **platform** super-admin, not company's admins.

## Commands

| Task                    | Command                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev servers (Turbopack) | `pnpm dev` — Turbo runs `dev` in every app that defines it (parallel). One app: `pnpm exec turbo run dev --filter=serva-hub` (or `auth-portal`, `serva-admin`). |
| Production build        | `pnpm build` (`turbo run build` for the whole workspace)                                                                                                        |
| ESLint                  | `pnpm lint`                                                                                                                                                     |
| Typecheck               | `pnpm check-types`                                                                                                                                              |
| React Email preview     | `pnpm --filter serva-hub run email`                                                                                                                             |
| Prisma client           | `pnpm --filter @serva/database run db:generate`                                                                                                                 |

Single-package builds (e.g. CI or matching Vercel): `pnpm exec turbo run build --filter=serva-hub` (swap package name as needed).

`postinstall` runs `pnpm --filter @serva/database run db:generate` (Prisma client output is under `libs/database/generated/prisma/`, gitignored). Seed entry: `libs/database/prisma/seed.ts`. Extra seeds/scripts may live under `scripts/`.

Do **not** paste real secrets into rules or this file; use env var **names** only (e.g. `DATABASE_URL`).

## Layout

| Area                                        | Package / Path                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Hub app routes                              | `apps/serva-hub/src/app/`                                                                                                |
| Auth app routes                             | `apps/auth-portal/src/app/`                                                                                              |
| Admin app routes                            | `apps/serva-admin/src/app/`                                                                                              |
| Database (Prisma, DAL)                      | `libs/database/` — `@serva/database` (client + types), `@serva/database/dal` (DAL in `src/dal/`)                         |
| Shared types, constants, utils, validations | `libs/shared/` — `@serva/shared`                                                                                         |
| Auth & session                              | `libs/auth/` — `@serva/auth` (session, authorize, permissions, cookies, password, rate-limiting)                         |
| UI (shadcn primitives)                      | `libs/serva-ui/src/components/` — `@serva/serva-ui`                                                                      |
| UI (Serva custom components)                | `libs/serva-ui/src/components/serva/` — `@serva/serva-ui` (app-designed components, icons registry in `constants/`)      |
| Email templates                             | `libs/serva-ui/src/components/emails/` — re-exported from `@serva/serva-ui` where listed in `libs/serva-ui/src/index.ts` |
| App-local lib                               | `apps/serva-hub/src/lib/` (validations, invite)                                                                          |
| App-local components                        | `apps/serva-hub/src/components/` (app-sidebar, feature-specific)                                                         |

Prisma schema: `libs/database/prisma/schema.prisma`. DAL functions live in `libs/database/src/dal/` and are imported via `@serva/database/dal`.

## Environment variables

| Variable                                | Description                                                                                                                | Example (dev)               | Example (prod)                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------- |
| `AUTH_URL`                              | Auth app base URL                                                                                                          | `http://localhost:3100`     | `https://auth.serva.com`        |
| `WEB_URL`                               | Hub app base URL                                                                                                           | `http://localhost:4100`     | `https://app.serva.com`         |
| `ADMIN_URL`                             | Admin app base URL                                                                                                         | `http://localhost:5100`     | `https://admin.serva.com`       |
| `NEXT_PUBLIC_AUTH_URL`                  | Auth URL exposed to client components                                                                                      | same as `AUTH_URL`          | same as `AUTH_URL`              |
| `NEXT_PUBLIC_ADMIN_URL`                 | Admin URL exposed to client components                                                                                     | same as `ADMIN_URL`         | same as `ADMIN_URL`             |
| `COOKIE_DOMAIN`                         | Shared cookie domain (omit for localhost)                                                                                  | _(unset)_                   | `.serva.com`                    |
| `DATABASE_URL`                          | MongoDB connection string                                                                                                  | _(in root .env)_            | _(in root .env)_                |
| `PLATFORM_COMPANY_IMPERSONATION_SECRET` | Shared HMAC secret for signed “open web app as company” links (`admin` → `auth` → `web`); **must match** on Auth and Admin | _(dev: set in root `.env`)_ | _(set on both Vercel projects)_ |

## Deployment (Vercel + Turborepo)

Each app is a **separate Vercel project** connected to the same Git repo. In Vercel project settings, set **Root Directory** to that app’s folder (not the monorepo root). Vercel detects **Turborepo** and runs installs from the repo root; the build typically runs `turbo run build` scoped to the app (or use an explicit command such as `cd ../.. && pnpm exec turbo run build --filter=<package-name>` from the app directory).

Declare environment variables on **each** Vercel project as today. **Turborepo strict env mode** means variables that affect a task must also appear under `env` / `globalEnv` in root `turbo.json` for correct passthrough and cache keys (Vercel warns if project env vars are missing from `turbo.json`). See [Turborepo — environment variables](https://turborepo.com/docs/crafting-your-repository/using-environment-variables).

| Project | Root Directory     | Domain            | Key env vars                                                                                                                         |
| ------- | ------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Hub     | `apps/serva-hub`   | `app.serva.com`   | `DATABASE_URL`, `AUTH_URL`, `WEB_URL`, `COOKIE_DOMAIN`                                                                               |
| Auth    | `apps/auth-portal` | `auth.serva.com`  | `DATABASE_URL`, `AUTH_URL`, `WEB_URL`, `ADMIN_URL`, `NEXT_PUBLIC_AUTH_URL`, `COOKIE_DOMAIN`, `PLATFORM_COMPANY_IMPERSONATION_SECRET` |
| Admin   | `apps/serva-admin` | `admin.serva.com` | `DATABASE_URL`, `AUTH_URL`, `ADMIN_URL`, `NEXT_PUBLIC_ADMIN_URL`, `COOKIE_DOMAIN`, `PLATFORM_COMPANY_IMPERSONATION_SECRET`           |

All three projects share `COOKIE_DOMAIN=.serva.com` so the session cookie set by Auth works across subdomains.

**Pipelines (root `turbo.json`):** `build` depends on `^build` and `@serva/database#db:generate`; `db:generate` runs Prisma client generation. `dev` is persistent and uncached; `lint` / `check-types` use `^` dependencies as configured.

## Conventions

- Prefer **small, task-scoped changes**; avoid drive-by refactors unrelated to the request.
- **Database**: import Prisma client, generated types, and `hashPassword` from `@serva/database`; import DAL functions from `@serva/database/dal` (not `PrismaClient` directly in UI).
- **Auth**: import session, authorize, and permission helpers from `@serva/auth` — not from scattered app files. Auth UI lives in `apps/auth-portal`; consumer apps redirect to `AUTH_URL` for login/logout.
- **UI**: import primitives, Serva components, `cn`, `ICONS`, etc. from **`@serva/serva-ui`** (see `libs/serva-ui/src/index.ts`). Use **`@serva/serva-ui/globals.css`** for global styles only. Composed forms use **`Field`**, **`FieldGroup`**, **`FieldLabel`**, **`FieldError`**, etc. from the barrel. **`InputField`** (react-hook-form, built on `Field`) imports from **`@serva/serva-ui/components/form/input-field`** only — excluded from the barrel on purpose.
- **Server vs client**: server components by default; add `"use client"` only when needed (hooks, browser APIs, interactivity).
- Match **existing naming**, imports (`@serva/*` for libs, `@/…` for app-local), and component patterns in the nearest feature folder.

## Permissions / roles

Roles and permissions are seeded (see `scripts/seed-roles-and-permissions.ts`). When changing access control, update the data model, seeds, and any `authorize`/session checks (in `@serva/auth`) together.

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->
