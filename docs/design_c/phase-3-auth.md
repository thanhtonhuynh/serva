# Phase 3: Session and auth layer

[← Back to Design C overview](README.md)

---

## 3.1 Update session type

In [src/lib/auth/session.ts](../../src/lib/auth/session.ts):

Session type (currently may still be named after the old User) becomes `SessionIdentity`:

```ts
export type SessionIdentity = {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  isAdminUser: boolean;
};
```

New `SessionContext` includes active company context:

```ts
export type SessionContext = {
  identity: SessionIdentity;
  companyId: string;
  operator: { id: string; role: UserRole; accountStatus: string } | null;
  employee: { id: string; role: UserRole; accountStatus: string } | null;
};
```

---

## 3.2 Update validateSessionToken

- Load `Identity` with `adminUser`, `operators` (filtered by active company from cookie/header), `employees` (same).
- Build `SessionContext` with the active company's operator and employee profiles.
- Session cookie still stores the token; add a `companyId` cookie (or include in session data) for company selection.

---

## 3.3 Add company selection flow

- After login, if identity has multiple companies, show company picker.
- If only one company, auto-select.
- Store `companyId` in a cookie or in the `Session` model (add `companyId` field to Session).

---

## 3.4 Update SessionProvider

In [src/contexts/SessionProvider.tsx](../../src/contexts/SessionProvider.tsx):

- Change context value from `{ session, user }` to `{ session, identity, companyId, operator, employee }`.
- Update `useSession()` return type.

---

## 3.5 Update access control

In [src/utils/access-control.ts](../../src/utils/access-control.ts):

- `hasPermission` takes operator's `UserRole` (or employee's, depending on context).
- `isAdminUser` check stays on identity level.
- Add helpers: `isOperator(session)`, `isEmployee(session)`.

---

## 3.6 Update auth actions

- Login: creates session, then resolves company context.
- Signup: creates Identity (no company yet; company assignment is a separate step or done via invite).
- Logout: unchanged (session deletion).
