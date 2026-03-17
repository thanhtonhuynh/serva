# Phase 5: App layer — Pages, actions, and components

[← Back to Design C overview](README.md)

---

## 5.1 Auth pages (minimal changes)

- Login/signup/reset-password: use `Identity` (already done if Phase 1.1 completed).
- Login flow: after successful auth, resolve company context (pick company or auto-select).

---

## 5.2 Schedule pages

- Schedules page: query `getEmployeesByCompany(companyId)` instead of `getEmployees({ excludeAdmin })`. No filtering needed.
- Schedules actions: permission check uses operator role from session. WorkDayRecord uses `employeeId`.
- Schedule grid components: `DisplayUser` becomes `DisplayEmployee`. `employee.identity.name` instead of `user.name`.

---

## 5.3 Team page

- Show both operators and employees (tabs or unified list).
- Team actions (activate/deactivate, role assignment): operate on `Operator` or `Employee` records.

---

## 5.4 Sales reports

- Reporter field: uses `operatorId` instead of `userId`.
- Audit logs: `operatorId` instead of `userId`.
- Report data-access: all queries scoped by `companyId`.

---

## 5.5 Hours and tips

- Queries scoped by `companyId`. Employee display shows `employee.identity.name`.

---

## 5.6 My shifts / profile

- `/my-shifts`: uses `employeeId` from session instead of `userId`.
- `/profile/[username]`: loads identity by username, then operator/employee for the current company.

---

## 5.7 Cashflow, expenses, store settings

- All scoped by `companyId`.
- Store settings page: reads/writes `CompanySettings` for current company.

---

## 5.8 Roles management

- All queries include `companyId`. Role names unique per company.

---

## 5.9 Sidebar and navigation

- Update `useSession()` usage. Show operator-specific nav items based on operator role. Show employee-specific items based on employee existence.
