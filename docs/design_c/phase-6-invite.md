# Phase 6: Invite and onboarding flow

[← Back to Design C overview](README.md)

---

## 6.1 Invite model

Add to [prisma/schema.prisma](../../prisma/schema.prisma):

```prisma
model Invite {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  companyId  String   @db.ObjectId
  company    Company  @relation(fields: [companyId], references: [id])
  email      String
  role       String   // "operator" | "employee" | "both"
  roleId     String?  @db.ObjectId
  token      String   @unique
  expiresAt  DateTime

  createdAt DateTime @default(now())

  @@unique([companyId, email])
}
```

Add the `invites Invite[]` relation to the `Company` model.

---

## 6.2 Invite flow

- Operator with `TEAM_MANAGE_ACCESS` creates invite (email, profile type, role).
- System sends invite email with token link.
- If recipient has an Identity: clicking link creates Operator/Employee in the company.
- If no Identity: clicking link goes to signup, then auto-creates the profile.

---

## 6.3 Company creation flow

- Platform admins (AdminUser) or self-service: create Company, become first Operator with Owner role.
