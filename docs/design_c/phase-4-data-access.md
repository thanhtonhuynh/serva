# Phase 4: Data-access layer

[← Back to Design C overview](README.md)

---

## 4.1 Rename and restructure

| Old file                           | New file                              | What changes                                                                                                                                                 |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/data-access/user.ts`          | `src/data-access/identity.ts`         | All functions query `Identity` (was `User`). Remove `roleId`, `accountStatus` from queries.                                                                  |
| `src/data-access/employee.ts`      | `src/data-access/employee.ts`         | Query `Employee` model directly (not `User` with filters). Add `getEmployeesByCompany(companyId)`, `getEmployeeByIdentityAndCompany(identityId, companyId)`. |
| _(new)_                            | `src/data-access/operator.ts`         | `getOperatorsByCompany(companyId)`, `getOperatorByIdentityAndCompany(identityId, companyId)`, `createOperator(...)`, `updateOperator(...)`.                  |
| _(new)_                            | `src/data-access/company.ts`          | `getCompany(companyId)`, `getCompaniesByIdentity(identityId)`, `createCompany(...)`.                                                                         |
| `src/data-access/store.ts`         | `src/data-access/company-settings.ts` | Query `CompanySettings` by `companyId` instead of global `StoreSettings`.                                                                                    |
| `src/data-access/roles.ts`         | `src/data-access/roles.ts`            | All queries scoped by `companyId`. `getRoles(companyId)`, `createRole(companyId, ...)`.                                                                      |
| `src/data-access/work-day-record/` | `src/data-access/work-day-record/`    | Replace `userId` with `employeeId` in all queries and types. Add `companyId` scoping.                                                                        |
| `src/data-access/report.ts`        | `src/data-access/report.ts`           | Replace `userId` with `operatorId`. Add `companyId` scoping.                                                                                                 |
| `src/data-access/expenses.ts`      | `src/data-access/expenses.ts`         | Add `companyId` scoping.                                                                                                                                     |

---

## 4.2 Update types

In [src/types/index.ts](../../src/types/index.ts):

- `DisplayUser` becomes two types:
  - `DisplayOperator` -- `{ id, identityId, companyId, accountStatus, role, identity: { name, username, email, image } }`
  - `DisplayEmployee` -- `{ id, identityId, companyId, accountStatus, locationId, departmentId, identity: { name, username, email, image } }`
- Remove `hiddenFromReports` from Identity types (moved to Employee if needed).

In [src/types/rbac.ts](../../src/types/rbac.ts):

- `UserRole` stays the same shape (name, isAdminUser, permissions).
- `RoleWithDetails._count.users` becomes `_count: { operators: number; employees: number }`.

---

## 4.3 Update work-day-record types

In [src/data-access/work-day-record/types.ts](../../src/data-access/work-day-record/types.ts):

- `workDayRecordSelectWithUser` becomes `workDayRecordSelectWithEmployee`:

```ts
export const workDayRecordSelectWithEmployee = {
  id: true,
  date: true,
  employeeId: true,
  shifts: true,
  totalHours: true,
  tips: true,
  employee: {
    select: {
      identity: { select: { name: true, username: true, image: true } },
    },
  },
} satisfies Prisma.WorkDayRecordSelect;
```
