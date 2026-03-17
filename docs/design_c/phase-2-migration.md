# Phase 2: Data migration script

[← Back to Design C overview](README.md)

---

Write a Node.js migration script (`scripts/migrate-design-c.ts`) that:

## 2.1 Create default Company

- Create one `Company` (e.g. name from env or "Default", slug: "default").
- Migrate `StoreSettings` to `CompanySettings` linked to this company.

## 2.2 Create Operator records

- For each existing `User` that has a role with admin-like permissions (or all users who access the dashboard): create an `Operator` record with `identityId`, `companyId`, `roleId`, `accountStatus` copied from the old User.

## 2.3 Create Employee records

- For each existing `User` that has `WorkDayRecord`s (or all non-AdminUser users): create an `Employee` record with `identityId`, `companyId`, `roleId`, `accountStatus`.
- Users who are both operator and employee get both records.

## 2.4 Migrate WorkDayRecord

- Update each `WorkDayRecord`: set `employeeId` from the new Employee record (looked up by old `userId` + `companyId`). Set `companyId`.

## 2.5 Migrate SaleReport

- Update each `SaleReport`: set `operatorId` from the new Operator record (looked up by old `userId` + `companyId`). Set `companyId`.

## 2.6 Migrate Expense

- Update each `Expense`: set `companyId` to the default company.

## 2.7 Migrate Role

- Update each `Role`: set `companyId` to the default company.

## 2.8 Clean up Identity

- Remove `roleId`, `accountStatus`, `hiddenFromReports` fields from Identity (done in schema, data already migrated).
