# Phase 1: Schema — New models and relations

[← Back to Design C overview](README.md)

---

## 1.1 Rename User to Identity

Rename `model User` to `model Identity` in [prisma/schema.prisma](../prisma/schema.prisma). Update all relation references (`Session.user`, `AdminUser.user`, etc.) to point to `Identity`. Keep the same MongoDB collection via `@@map("User")` to avoid data loss.

```prisma
model Identity {
  id            String  @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  username      String  @unique
  email         String  @unique
  emailVerified Boolean @default(false)
  passwordHash  String?
  image         String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  adminUser                AdminUser?
  sessions                 Session[]
  emailVerificationRequest EmailVerificationRequest?
  passwordResetTokens      PasswordResetToken[]
  operators                Operator[]
  employees                Employee[]

  @@map("User")
}
```

Fields removed from Identity (moved to Operator/Employee):

- `accountStatus` -- moves to Operator and Employee
- `hiddenFromReports` -- moves to Employee
- `roleId` / `role` -- moves to Operator and Employee
- `saleReports` -- moves to Operator
- `workDayRecords` -- moves to Employee

---

## 1.2 Add Company model

```prisma
model Company {
  id   String @id @default(auto()) @map("_id") @db.ObjectId
  name String
  slug String @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  settings    CompanySettings?
  locations   Location[]
  departments Department[]
  roles       Role[]
  operators   Operator[]
  employees   Employee[]
  saleReports SaleReport[]
  expenses    Expense[]
}
```

---

## 1.3 Add CompanySettings (replaces StoreSettings)

```prisma
model CompanySettings {
  id         String @id @default(auto()) @map("_id") @db.ObjectId
  companyId  String @unique @db.ObjectId
  company    Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  startCash       Int
  activePlatforms String[] @default(["uber_eats", "doordash", "skip_the_dishes", "ritual"])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 1.4 Add Location and Department

```prisma
model Location {
  id         String @id @default(auto()) @map("_id") @db.ObjectId
  companyId  String @db.ObjectId
  company    Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  name       String

  employees Employee[]

  @@unique([companyId, name])
}

model Department {
  id         String @id @default(auto()) @map("_id") @db.ObjectId
  companyId  String @db.ObjectId
  company    Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  name       String

  employees Employee[]

  @@unique([companyId, name])
}
```

---

## 1.5 Add Operator model

```prisma
model Operator {
  id            String @id @default(auto()) @map("_id") @db.ObjectId
  identityId    String @db.ObjectId
  identity      Identity @relation(fields: [identityId], references: [id], onDelete: Cascade)
  companyId     String @db.ObjectId
  company       Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  roleId        String? @db.ObjectId
  role          Role? @relation(fields: [roleId], references: [id])
  accountStatus String @default("active")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  saleReports SaleReport[]

  @@unique([identityId, companyId])
}
```

---

## 1.6 Add Employee model

```prisma
model Employee {
  id            String @id @default(auto()) @map("_id") @db.ObjectId
  identityId    String @db.ObjectId
  identity      Identity @relation(fields: [identityId], references: [id], onDelete: Cascade)
  companyId     String @db.ObjectId
  company       Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  roleId        String? @db.ObjectId
  role          Role? @relation(fields: [roleId], references: [id])
  accountStatus String @default("active")
  locationId    String? @db.ObjectId
  location      Location? @relation(fields: [locationId], references: [id])
  departmentId  String? @db.ObjectId
  department    Department? @relation(fields: [departmentId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workDayRecords WorkDayRecord[]

  @@unique([identityId, companyId])
}
```

---

## 1.7 Scope Role to Company

```prisma
model Role {
  id          String  @id @default(auto()) @map("_id") @db.ObjectId
  companyId   String  @db.ObjectId
  company     Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  name        String
  description String?
  editable    Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  permissionIds String[]     @db.ObjectId
  permissions   Permission[] @relation(fields: [permissionIds], references: [id])

  operators Operator[]
  employees Employee[]

  @@unique([companyId, name])
}
```

---

## 1.8 Update FK references on existing models

- **Session** -- `identityId` (was `userId`), relation to `Identity`
- **AdminUser** -- `identityId` (was `userId`), relation to `Identity`
- **SaleReport** -- add `companyId` FK to `Company`; change `userId` to `operatorId` FK to `Operator`; `ReportAudit.userId` becomes `ReportAudit.operatorId`
- **WorkDayRecord** -- add `companyId` FK to `Company`; change `userId` to `employeeId` FK to `Employee`; `@@unique([date, employeeId])`
- **Expense** -- add `companyId` FK to `Company`
