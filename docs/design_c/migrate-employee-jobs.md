# Migrate employee RBAC roles → Job (Chef / Server)

## Schema

- New model **`Job`**: tenant-scoped titles only (`Company` + `name`), unique per `(companyId, name)`.
- **`Employee.jobId`** → optional link to `Job`.
- **`Employee.roleId`** was **removed** from the schema after this migration ran (use **`jobId`** only).

Operator roles (**Admin**, **Manager**) stay on **`Operator.roleId`** only.

## Apply Prisma schema

```bash
npx prisma generate
npx prisma db push
```

## Run data migration

Dry run (no writes):

```bash
DRY_RUN=1 npx tsx scripts/migrate-employee-roles-to-jobs.ts
```

Apply:

```bash
npx tsx scripts/migrate-employee-roles-to-jobs.ts
```

### Script behavior

For each company:

1. Ensures `Job` rows **`Chef`** and **`Server`** exist.
2. For each `Employee`:
   - If `roleId` points at a **Role** named **Admin** or **Manager** (case-insensitive) → `jobId = null`.
   - If role name is **Chef** or **Server** → sets `jobId` to that company’s Job.
   - Any other role (e.g. **Team Member**) → `jobId = null`.
3. Sets **`roleId = null`** on every employee (disconnect from RBAC `Role`).

## Follow-up (cleanup)

1. ~~Remove `roleId` / `role` from `Employee`~~ **Done** — also removed `employees` back-relation on `Role`.
2. ~~Update `scripts/migrate-design-c.ts`~~ **Done** — new `Employee` rows use **`jobId`** (Chef/Server) where applicable.
3. Add UI to assign **Job** (Chef/Server) on the Team **Employees** tab if needed.

## App behavior

- **`companyCtx.permissions`**: from **operator** RBAC only; employees are not a permission source.
- Sidebar “subtitle” for employee-only users: **job name** (e.g. Chef) or **Team member** if no job.
