# Migration Remaining Work: Phase 5 & 6

[← Back to Design C overview](README.md)

---

This document lists what is still left after completing **Phase 4** (data-access + type refactor).

## Phase 5: App layer — what is left

### Status check (high level)

- **Likely done / mostly done:** schedules, hours & tips, my-shifts, profile, sales reports, cashflow/expenses/store settings, roles management, most permission-driven sidebar filtering.
- **Not done:** Team page + Team role assignment actions (operator + employee role updates).

### 5.3 Team page (INCOMPLETE)

`src/app/(main)/team/page.tsx` currently fetches employees and roles, but the UI that renders the team list is commented out:

- Enable rendering for the chosen `view` (table/cards).
- Support **both** `operator` and `employee` records for the active `companyCtx.companyId`.
  - Fetch operators: `getOperatorsByCompany(companyCtx.companyId)`
  - Fetch employees: `getEmployeesByCompany(companyCtx.companyId)`
- Decide on the UX:
  - Tabs (operators vs employees), or
  - Unified list (requires a shared display model and shared actions).

### 5.3 Team actions (ROLE ASSIGNMENT BUG / TODO)

`src/app/(main)/team/_actions/index.ts` contains a TODO in `updateIdentityRoleAction` indicating that role assignment is not implemented yet:

- Replace the current identity-only placeholder with updates to the tenant-scoped models:
  - Update `Operator.roleId` when the target is an operator
  - Employees use **`jobId`** (Chef/Server), not RBAC `roleId` — assign job in UI/DAL when needed
- Update action inputs so they carry the correct IDs.

#### Critical ID mismatch (UI vs action expectations)

The current Team UI components pass `employee.id` / `selectedUser.id` where the action/validation expects **identityId**.

Concretely, check the following flows and fix them:

- `activateUserAction(...)` / `deactivateUserAction(...)` expect an `identityId`, but the current UI appears to pass the `Employee.id` (employee record id).
- `ChangeRoleModal` sets `identityId: selectedUser.id` in the form defaults, but `identityId` should be `selectedUser.identityId`.

This is runtime-dangerous (TypeScript won’t always catch it because the values are `string`), so it must be corrected.

### 5.2 Schedule grid component types (verify operator path)

Schedules currently use `getEmployeesByCompany(companyId)` and render `DisplayEmployee`. This is fine for schedules if schedules are employee-only.

If the product expects operators to appear in schedules too, then the schedule pipeline needs a further adjustment (fetch operators, merge the two display types, etc.).

### 5.9 Sidebar & navigation (verify “operator-specific nav” requirement)

The sidebar currently filters by permissions using:

- `hasPermission(identity, companyCtx, permissionCode)`

If the remaining requirement is “show operator-specific nav items even before the permission check / role-name check,” then the sidebar config should be extended to include operator-vs-employee visibility logic.

## Phase 6: Invite and onboarding flow (NOT STARTED)

Phase 6 is currently only described in documentation (`docs/design_c/phase-6-invite.md`) but not implemented in the codebase:

- There is no `Invite` model present in `prisma/schema.prisma`.
- There are no invite DAL/actions/routes implemented.
- The existing `select-company` page text mentions invites, but there is no invite token handling flow.

### 6.1 Invite model

Add `Invite` to Prisma per the doc, plus:

- Add `invites Invite[]` relation to `Company`.
- Run migrations and update any seed scripts if needed.

### 6.2 Invite flow (create + email)

Implement:

- An action/route where an operator with `TEAM_MANAGE_ACCESS` creates an invite for a target email + profile type + role.
- Token generation and persistence (with `expiresAt`).
- Email sending logic:
  - Use existing email utilities (see `src/lib/email.ts`) or add a new helper.

### 6.2 Invite flow (accept / consume token)

Implement a token consumption route/page, roughly:

- Validate token + expiry.
- Determine if the recipient already has an `Identity`:
  - If identity exists: create `Operator` or `Employee` rows tied to `Invite.companyId` (and assign `roleId` if supplied).
  - If identity does not exist: route to signup and carry the invite token forward (so signup can auto-create the operator/employee after Identity creation).
- On completion:
  - Ensure the session/company selection redirects into the invited company.

### 6.3 Company creation flow

If Phase 6 includes “company creation by platform admins or self-service”, then implement the creation entrypoints and ensure first operator role assignment is consistent with the tenant RBAC model.

## Next implementation order (recommended)

1. Finish Team UI rendering (`src/app/(main)/team/page.tsx`) for both operators + employees.
2. Fix Team action ID mismatches and implement role assignment updates (`team/_actions` + supporting DAL).
3. Implement Invite model + DAL + token consumption route + signup handoff.

