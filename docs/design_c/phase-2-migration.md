# Phase 2: Data migration script

[← Back to Design C overview](README.md)

---

Write a Node.js migration script (`scripts/migrate-design-c.ts`) that:

## 2.1 Create default Company

- Create one `Company` (e.g. name from env or "Default", slug: "default").
- Migrate `StoreSettings` to `CompanySettings` linked to this company.

## 2.2 Create Operator records

- For each existing `Identity` that has a role with admin-like permissions (or all identities who access the dashboard): create an `Operator` record with `identityId`, `companyId`, `roleId`, `accountStatus` copied from the current Identity (and its role).

## 2.3 Create Employee records

- For each existing `Identity` that has `WorkDayRecord`s (or all non-AdminUser identities): create an `Employee` record with `identityId`, `companyId`, `roleId`, `accountStatus`.
- Identities who are both operator and employee get both records.

## 2.4 Migrate WorkDayRecord

- Update each `WorkDayRecord`: set `employeeId` from the new Employee record (looked up by current `identityId` + `companyId`). Set `companyId`.

## 2.5 Migrate SaleReport

- Update each `SaleReport`: set `operatorId` from the new Operator record (looked up by current reporter `identityId` + `companyId`). Set `companyId`.

## 2.6 Migrate Expense

- Update each `Expense`: set `companyId` to the default company.

## 2.7 Migrate Role

- Update each `Role`: set `companyId` to the default company.

## 2.8 Clean up Identity

- Remove `roleId`, `hiddenFromReports` from Identity (done in schema, data already migrated). **Keep `accountStatus`** on Identity for auth-level account status.
