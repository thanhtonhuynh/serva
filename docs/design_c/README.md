# Design C: Identity / Company / Operator / Employee Migration Plan

## Overview

Restructure Serva from a single `User` model into four distinct concerns:

- **Identity** (renamed from `User`) -- platform authentication only
- **Company** -- multi-tenant company container
- **Operator** -- company management profiles (owners, managers, accountants)
- **Employee** -- schedulable worker profiles (shifts, tips, hours)
- **AdminUser** -- unchanged, platform super admins

```mermaid
erDiagram
    Identity {
        String id PK
        String email UK
        String name
        String username UK
        String passwordHash
        String image
        Boolean emailVerified
        String accountStatus
    }

    AdminUser {
        String id PK
        String identityId FK UK
    }

    Company {
        String id PK
        String name
        String slug UK
    }

    CompanySettings {
        String id PK
        String companyId FK UK
        Int startCash
        String_arr activePlatforms
    }

    Location {
        String id PK
        String companyId FK
        String name
    }

    Department {
        String id PK
        String companyId FK
        String name
    }

    Role {
        String id PK
        String companyId FK
        String name
    }

    Operator {
        String id PK
        String identityId FK
        String companyId FK
        String roleId FK
        String accountStatus
    }

    Employee {
        String id PK
        String identityId FK
        String companyId FK
        String roleId FK
        String accountStatus
        String locationId FK
        String departmentId FK
    }

    Identity ||--o| AdminUser : "platform admin"
    Identity ||--o{ Operator : "manages companies"
    Identity ||--o{ Employee : "works at companies"
    Company ||--o{ Operator : "has operators"
    Company ||--o{ Employee : "has employees"
    Company ||--o| CompanySettings : "settings"
    Company ||--o{ Location : "locations"
    Company ||--o{ Department : "departments"
    Company ||--o{ Role : "scoped roles"
    Operator }o--|| Role : "has role"
    Employee }o--o| Role : "has role"
    Employee }o--o| Location : "works at"
    Employee }o--o| Department : "belongs to"
```

---

## Progress

- **Phase 1.1 done:** Model renamed from `User` to `Identity`; all relation references updated in schema and codebase (`identityId` everywhere). Remaining: add Company, CompanySettings, Location, Department, Operator, Employee, scope Role to Company, and update FKs (1.2–1.8).

---

## Phase index

| Phase | File | Description |
|-------|------|-------------|
| 1 | [phase-1-schema.md](phase-1-schema.md) | Prisma schema: Identity, Company, Operator, Employee, Location, Department, CompanySettings, scoped Role, updated FKs |
| 2 | [phase-2-migration.md](phase-2-migration.md) | Data migration script: create default company, Operator/Employee records, migrate FKs |
| 3 | [phase-3-auth.md](phase-3-auth.md) | Session and auth: SessionContext, company selection, validateSessionToken, SessionProvider, access-control |
| 4 | [phase-4-data-access.md](phase-4-data-access.md) | Data-access layer: identity, operator, employee, company, company-settings, scoped roles, work-day-record, report, expenses |
| 5 | [phase-5-app.md](phase-5-app.md) | App layer: pages, actions, components (schedules, team, reports, hours-tips, my-shifts, profile, cashflow, expenses, settings, sidebar) |
| 6 | [phase-6-invite.md](phase-6-invite.md) | Invite model and onboarding: invite creation, acceptance, company creation |

---

## Execution order

Phases are designed to be done sequentially. Each phase should be a working state:

- **Phase 1** -- Schema changes + `prisma generate` (app will have type errors but DB is ready)
- **Phase 2** -- Run migration script to populate new models from existing data
- **Phase 3** -- Session/auth compiles and works with new models
- **Phase 4** -- Data-access layer compiles; old queries replaced
- **Phase 5** -- All pages/actions updated; app is fully functional
- **Phase 6** -- New invite/onboarding features (can be done later)
