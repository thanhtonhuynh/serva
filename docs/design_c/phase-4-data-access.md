# Phase 4: Data-access layer

[← Back to Design C overview](README.md)

---

## Context (after Phase 3)

Phase 3 established:

- **`Identity`** (no role on the model) — platform auth fields only; **`isPlatformAdmin`** for super admins.
- **`CompanyContext`** — `companyId`, `operator` / `employee` (each with simplified `role` + `status`), merged **`permissions`**.
- **`authGuard()`** / **`authGuardWithRateLimit()`** — return `{ identity, companyCtx }`; redirect when unauthenticated, inactive, or no company selected.
- **`hasPermission(identity, companyCtx, permissionCode)`** — pure permission check ([src/lib/auth/permission.ts](../../src/lib/auth/permission.ts)).
- **`SessionProvider`** — `{ session, identity, companyCtx }`.
- **Company selection** — `companyId` cookie; [`/select-company`](../../src/app/(auth)/select-company/page.tsx) when multiple companies.

**Tenant scope for data access:** every query that reads or writes tenant data must filter by **`companyCtx.companyId`** (or take `companyId` as an explicit argument from the caller, which got it from session).

**Current gaps:** most DAL queries are still **unscoped** (no `companyId`). [`employee.ts`](../../src/data-access/employee.ts) still queries **`Identity`** instead of **`Employee`**. Work-day-record DAL still uses **`identityId`** in places where the schema uses **`employeeId`** + **`companyId`**.

---

## 4.1 Rename and restructure files

| Old / current | New / target | What changes |
| --- | --- | --- |
| [`src/data-access/user.ts`](../../src/data-access/user.ts) | `src/data-access/identity.ts` | All functions query **`Identity`** only (no `role` includes). **Keep `accountStatus`** on Identity. Rename file and update imports across the app. |
| [`src/data-access/employee.ts`](../../src/data-access/employee.ts) | same path, **rewrite** | Query **`Employee`** model. Add `getEmployeesByCompany(companyId)`, `getEmployeeByIdentityAndCompany(identityId, companyId)`, `getEmployeeById(id)`. Remove `getEmployees({ status, excludeAdmin })` and `getEmployeesByIds` as implemented today (Identity-based). |
| _(new)_ | [`src/data-access/operator.ts`](../../src/data-access/operator.ts) | `getOperatorsByCompany(companyId)`, `getOperatorByIdentityAndCompany(identityId, companyId)`, `getOperatorById(id)`. Optional later: `createOperator` / `updateOperator` if not inlined in actions. |
| [`src/data-access/company/`](../../src/data-access/company/) | extend [`dal.ts`](../../src/data-access/company/dal.ts) | Already has `getCompaniesByIdentityId`. Add **`getCompanyById(companyId)`**, **`getCompanyBySlug(slug)`**. |
| [`src/data-access/store.ts`](../../src/data-access/store.ts) | `src/data-access/company-settings.ts` | Replace global **`StoreSettings`** with **`CompanySettings`** scoped by **`companyId`**: `getCompanySettings(companyId)`, `getStartCash(companyId)`, `getActivePlatforms(companyId)`, `updateCompanySettings(companyId, data)`. |
| [`src/data-access/roles.ts`](../../src/data-access/roles.ts) | same path | Scope by **`companyId`**: `getRoles(companyId)`, `createRole(companyId, …)`, `roleNameExists(name, companyId, excludeId?)`. `getRoleById` can stay global by id. |

---

## 4.2 Add `companyId` scoping to report and expenses

### [`src/data-access/report.ts`](../../src/data-access/report.ts)

- Add **`companyId`** to **all** list/range/year queries: e.g. `getRecentReports(companyId, limit)`, `getReportsByDateRange(companyId, dateRange)`, `getReportsForYear(companyId, year)`, `getFirstReportDate(companyId)`, etc.
- **`upsertReport(data, identityId, companyId)`** — set **`companyId`** on create/update; reporter remains **`identityId`** (Identity).
- **`getRecentReportsByIdentity`** — add **`companyId`** filter so profile/reports are tenant-scoped.

### [`src/data-access/expenses.ts`](../../src/data-access/expenses.ts)

- **`createExpenses(data, companyId)`** — required on create.
- **`getExpensesByYear(companyId, year)`**, and any list queries — filter by **`companyId`**.
- **`getExpenseById` / `deleteExpense` / `updateExpenses`** — ensure the row belongs to the expected company (verify `companyId` in where or after fetch).

---

## 4.3 Rewrite work-day-record DAL and types

Schema: **`WorkDayRecord`** uses **`employeeId`** + **`companyId`**; unique **`[date, employeeId]`**.

### [`src/data-access/work-day-record/types.ts`](../../src/data-access/work-day-record/types.ts)

- Rename **`workDayRecordSelectWithIdentity`** → **`workDayRecordSelectWithEmployee`**.
- Select **`employeeId`**, relation **`employee`** → **`identity`** (name, username, image).
- Rename types **`WorkDayRecordWithIdentity`** → **`WorkDayRecordWithEmployee`**, update **`WorkDayRecordsByDate`**.

### [`src/data-access/work-day-record/dal.ts`](../../src/data-access/work-day-record/dal.ts)

- Replace **`identityId`** with **`employeeId`** everywhere; use **`date_employeeId`** for upsert where applicable.
- **`upsertWorkDayRecord`** — input uses **`employeeId`**; include **`companyId`** on create.
- **`replaceWeekSchedule(companyId, dateRange, days)`** — creates use **`employeeId`** + **`companyId`**; deletes scoped to company + date range.
- **`deleteWorkDayRecord(date, employeeId)`**; **`deleteWorkDayRecordsByEmployeeIds(date, employeeIds)`** (rename from identity-based).
- **`deleteWorkDayRecordsByDate(companyId, date)`** — scoped.
- **`getWorkDayRecordsByDate(companyId, date)`** — scoped; order by employee display name via **`employee.identity`**.
- **`getWorkDayRecordsByDateRange(companyId, dateRange)`** — scoped; use new select shape.
- **`getWorkDayRecordsByEmployeeAndDateRange(employeeId, dateRange)`** — replace identity-based naming.
- **`getRecentWorkDayRecordsByEmployee(employeeId, limit)`** — replace **`getRecentWorkDayRecordsByIdentity`**.
- **`recomputeTipsForDate(companyId, date)`** / **`recomputeTipsForDateRange(companyId, dateRange)`** — join/filter reports and records by **`companyId`**.

### [`src/lib/validations/work-day-record.ts`](../../src/lib/validations/work-day-record.ts)

- **`WorkDayRecordSchema`**: **`identityId`** → **`employeeId`**.

---

## 4.4 Update display types

In [`src/types/index.ts`](../../src/types/index.ts):

- Split **`DisplayUser`** into:
  - **`DisplayOperator`** — `{ id, identityId, companyId, status, role, identity: { name, username, email, image } }`
  - **`DisplayEmployee`** — `{ id, identityId, companyId, status, role, locationId?, departmentId?, identity: { name, username, email, image } }`  
  (Use **`status`** to align with Prisma **`Operator.status`** / **`Employee.status`**.)
- **`TotalHoursTips`** / **`BreakdownData`**: optionally rename fields from **`identityId`** to clearer display keys once rows are keyed by **`employee`** (e.g. keep human-readable names from **`employee.identity`**).
- Remove duplicate **`RoleWithPermissions`** if it duplicates [`src/types/rbac.ts`](../../src/types/rbac.ts).

[`src/types/rbac.ts`](../../src/types/rbac.ts) — already uses **`RoleWithDetails._count: { operators, employees }`**; keep aligned with Prisma.

---

## 4.5 App layer touchpoints (Phase 5)

When DAL signatures change, update callers (pages/actions/components). Typical replacements:

| Area | From | To |
| --- | --- | --- |
| Schedules | `getEmployees(...)` | `getEmployeesByCompany(companyId)` |
| Team | Identity list | `getEmployeesByCompany` + `getOperatorsByCompany` |
| Hours & tips | unscoped WDR queries | `getWorkDayRecordsByDateRange(companyId, …)` |
| My shifts | `getWorkDayRecordsByIdentityAndDateRange(identity.id)` | `getWorkDayRecordsByEmployeeAndDateRange(companyCtx.employee.id, …)` (guard **`employee`**) |
| Reports | `upsertReport(data, identityId)` | `upsertReport(data, identityId, companyId)` |
| Store settings | `getStartCash()` | `getStartCash(companyId)` / `getCompanySettings(companyId)` |
| Expenses | unscoped | pass **`companyId`** into create/list/update |
| Roles admin | `getRoles()` | `getRoles(companyId)`; **`createRole(companyId, …)`** |

See [phase-5-app.md](phase-5-app.md) for page-by-page UI work.

---

## Execution checklist

1. Rename **`user.ts`** → **`identity.ts`** and fix imports.
2. Add **`operator.ts`**; rewrite **`employee.ts`**.
3. Extend **`company/dal.ts`**; replace **`store.ts`** with **`company-settings.ts`**.
4. Scope **`roles.ts`**, **`report.ts`**, **`expenses.ts`**.
5. Rewrite **`work-day-record/`** + validations.
6. Update **`types/index.ts`** (DisplayOperator / DisplayEmployee).
7. Run **`pnpm build`** / fix remaining import errors; then Phase 5 for routes and actions.
