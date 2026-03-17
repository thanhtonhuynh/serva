/**
 * Phase 2: Data migration for Design C (Identity / Company / Operator / Employee).
 *
 * Creates the default company "Ongba Eatery", migrates StoreSettings → CompanySettings,
 * creates Operator/Employee records, and migrates FKs on WorkDayRecord, SaleReport, Expense, Role.
 *
 * Usage:
 *   npx tsx scripts/migrate-design-c.ts           # run migration
 *   npx tsx scripts/migrate-design-c.ts --dry-run # preview only, no writes
 *   DRY_RUN=1 npx tsx scripts/migrate-design-c.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_COMPANY = {
  name: "Ongba Eatery",
  slug: "ongba-eatery",
};

const isDryRun = (): boolean =>
  process.env.DRY_RUN === "1" ||
  process.env.DRY_RUN === "true" ||
  process.argv.includes("--dry-run");

function logDryRun(msg: string): void {
  if (isDryRun()) console.log("[DRY RUN]", msg);
}

// ---------------------------------------------------------------------------
// 2.1 Create default Company
// ---------------------------------------------------------------------------

export async function taskCreateDefaultCompany(): Promise<string | null> {
  const dryRun = isDryRun();
  const existing = await prisma.company.findUnique({
    where: { slug: DEFAULT_COMPANY.slug },
  });
  if (existing) {
    console.log(`Company already exists: ${existing.name} (${existing.id})`);
    return existing.id;
  }
  if (dryRun) {
    logDryRun(`Would create Company: ${DEFAULT_COMPANY.name}, slug: ${DEFAULT_COMPANY.slug}`);
    return null;
  }
  const company = await prisma.company.create({
    data: { name: DEFAULT_COMPANY.name, slug: DEFAULT_COMPANY.slug },
  });
  console.log(`Created Company: ${company.name} (${company.id})`);
  return company.id;
}

// ---------------------------------------------------------------------------
// 2.1 (continued) Migrate StoreSettings → CompanySettings
// ---------------------------------------------------------------------------

export async function taskMigrateStoreSettingsToCompanySettings(companyId: string): Promise<void> {
  const dryRun = isDryRun();
  const storeSettings = await prisma.storeSettings.findFirst({ where: {} });
  if (!storeSettings) {
    console.log("No StoreSettings found; skipping CompanySettings migration.");
    return;
  }
  const existing = await prisma.companySettings.findUnique({
    where: { companyId },
  });
  if (existing) {
    console.log("CompanySettings already exist for this company.");
    return;
  }
  if (dryRun) {
    logDryRun(
      `Would create CompanySettings for company ${companyId} (startCash: ${storeSettings.startCash}, activePlatforms: ${storeSettings.activePlatforms.length} platforms)`,
    );
    return;
  }
  await prisma.companySettings.create({
    data: {
      companyId,
      startCash: storeSettings.startCash,
      activePlatforms: storeSettings.activePlatforms,
    },
  });
  console.log("Created CompanySettings from StoreSettings.");
}

// ---------------------------------------------------------------------------
// 2.7 Migrate Role — set companyId on all existing Roles (some may have null companyId in DB)
// ---------------------------------------------------------------------------

type RoleRaw = { _id: { $oid: string }; companyId?: string | null };

export async function taskMigrateRoleToCompany(companyId: string): Promise<void> {
  const dryRun = isDryRun();
  // Use findRaw so we can read Role docs that have null/missing companyId (Prisma findMany would throw)
  const raw = await (
    prisma as unknown as { role: { findRaw: (args: { filter: object }) => Promise<RoleRaw[]> } }
  ).role.findRaw({ filter: {} });
  const roles = Array.isArray(raw) ? raw : [];
  const toMigrate = roles.filter((r) => (r.companyId ?? "") !== companyId);
  if (toMigrate.length === 0) {
    console.log("No Role records need companyId migration.");
    return;
  }
  if (dryRun) {
    logDryRun(`Would set companyId=${companyId} on ${toMigrate.length} Role(s).`);
    return;
  }
  for (const r of toMigrate) {
    const id = r._id?.$oid ?? (r as unknown as { _id: string })._id;
    if (!id) continue;
    await prisma.role.update({
      where: { id },
      data: { companyId },
    });
  }
  console.log(`Updated companyId on ${toMigrate.length} Role(s).`);
}

// ---------------------------------------------------------------------------
// Helpers: read legacy roleId from Identity (not in current schema)
// ---------------------------------------------------------------------------

type IdentityRaw = { _id: { $oid: string }; roleId?: { $oid: string }; accountStatus?: string };

async function getIdentitiesWithLegacyRoleId(): Promise<
  { id: string; roleId: string | null; accountStatus: string }[]
> {
  const cursor = await (
    prisma as unknown as {
      identity: { findRaw: (args: { filter: object }) => Promise<IdentityRaw[]> };
    }
  ).identity.findRaw({
    filter: {},
  });
  const raw = Array.isArray(cursor) ? cursor : [];
  return raw.map((doc) => ({
    id: doc._id?.$oid ?? doc._id,
    roleId: doc.roleId?.$oid ?? null,
    accountStatus: doc.accountStatus ?? "active",
  }));
}

// ---------------------------------------------------------------------------
// 2.2 Create Operator records (identities with company-level Admin or Manager role only)
// ---------------------------------------------------------------------------

const OPERATOR_ROLE_NAMES = ["Admin", "Manager"];

export async function taskCreateOperators(companyId: string): Promise<void> {
  const dryRun = isDryRun();
  const identitiesWithRole = await getIdentitiesWithLegacyRoleId();
  const operatorRoleIds = new Set(
    (
      await prisma.role.findMany({
        where: { companyId, name: { in: OPERATOR_ROLE_NAMES } },
        select: { id: true },
      })
    ).map((r) => r.id),
  );
  const identities = await prisma.identity.findMany({
    select: { id: true, name: true },
  });
  const identityMap = new Map(identities.map((i) => [i.id, i]));

  const toCreate = identitiesWithRole.filter(
    (i) => i.roleId != null && operatorRoleIds.has(i.roleId),
  );

  const existing = await prisma.operator.findMany({
    where: { companyId },
    select: { identityId: true },
  });
  const existingSet = new Set(existing.map((o) => o.identityId));
  const newOps = toCreate.filter((i) => !existingSet.has(i.id));

  if (newOps.length === 0) {
    console.log("No new Operator records to create.");
    return;
  }

  if (dryRun) {
    logDryRun(`Would create ${newOps.length} Operator(s) for company ${companyId}.`);
    newOps.forEach((i) => {
      const name = identityMap.get(i.id)?.name ?? "Unknown";
      logDryRun(`  - identityId=${i.id} (${name}), roleId=${i.roleId}, status=${i.accountStatus}`);
    });
    return;
  }

  for (const i of newOps) {
    const identity = identityMap.get(i.id);
    await prisma.operator.create({
      data: {
        identityId: i.id,
        companyId,
        roleId: i.roleId ?? undefined,
        status: i.accountStatus === "active" ? "active" : "inactive",
        name: identity?.name ?? "Operator",
      },
    });
  }
  console.log(`Created ${newOps.length} Operator(s).`);
}

// ---------------------------------------------------------------------------
// Helpers: get identityIds that appear in WorkDayRecords (legacy identityId)
// ---------------------------------------------------------------------------

type WorkDayRecordRaw = { _id: { $oid: string }; identityId?: { $oid: string }; date?: string };

async function getWorkDayRecordIdentityIds(): Promise<Set<string>> {
  const raw = await (
    prisma as unknown as {
      workDayRecord: { findRaw: (args: { filter: object }) => Promise<WorkDayRecordRaw[]> };
    }
  ).workDayRecord.findRaw({
    filter: {},
  });
  const arr = Array.isArray(raw) ? raw : [];
  const ids = new Set<string>();
  for (const doc of arr) {
    const id = doc.identityId?.$oid ?? (doc as unknown as { identityId?: string }).identityId;
    if (id) ids.add(id);
  }
  return ids;
}

// ---------------------------------------------------------------------------
// 2.3 Create Employee records (identities with company-level Server, Chef, or Team Member role only)
// ---------------------------------------------------------------------------

const EMPLOYEE_ROLE_NAMES = ["Server", "Chef", "Team Member"];

export async function taskCreateEmployees(companyId: string): Promise<void> {
  const dryRun = isDryRun();
  const identitiesWithRole = await getIdentitiesWithLegacyRoleId();
  const employeeRoleIds = new Set(
    (
      await prisma.role.findMany({
        where: { companyId, name: { in: EMPLOYEE_ROLE_NAMES } },
        select: { id: true },
      })
    ).map((r) => r.id),
  );
  const identities = await prisma.identity.findMany({
    select: { id: true, name: true },
  });
  const identityMap = new Map(identities.map((i) => [i.id, i]));

  const toCreate = identitiesWithRole.filter(
    (i) => i.roleId != null && employeeRoleIds.has(i.roleId),
  );

  const existing = await prisma.employee.findMany({
    where: { companyId },
    select: { identityId: true },
  });
  const existingSet = new Set(existing.map((e) => e.identityId));
  const newEmps = toCreate.filter((i) => !existingSet.has(i.id));

  if (newEmps.length === 0) {
    console.log("No new Employee records to create.");
    return;
  }

  if (dryRun) {
    logDryRun(`Would create ${newEmps.length} Employee(s) for company ${companyId}.`);
    newEmps.forEach((i) => {
      const name = identityMap.get(i.id)?.name ?? "Unknown";
      logDryRun(`  - identityId=${i.id} (${name}), roleId=${i.roleId}`);
    });
    return;
  }

  for (const i of newEmps) {
    const identity = identityMap.get(i.id);
    await prisma.employee.create({
      data: {
        identityId: i.id,
        companyId,
        name: identity?.name ?? "Employee",
        roleId: i.roleId ?? undefined,
        status: i.accountStatus === "active" ? "active" : "inactive",
      },
    });
  }
  console.log(`Created ${newEmps.length} Employee(s).`);
}

// ---------------------------------------------------------------------------
// Create Employee records for identities that have WorkDayRecords but no Employee yet
// (e.g. Admin/Manager identities who also have shifts — so we can link their WorkDayRecords)
// ---------------------------------------------------------------------------

export async function taskCreateEmployeesForWorkDayRecords(companyId: string): Promise<void> {
  const dryRun = isDryRun();
  const identityIdsWithWork = await getWorkDayRecordIdentityIds();
  if (identityIdsWithWork.size === 0) {
    console.log("No WorkDayRecords with legacy identityId found; nothing to do.");
    return;
  }

  const identities = await prisma.identity.findMany({
    where: { id: { in: [...identityIdsWithWork] } },
    select: { id: true, name: true },
  });
  const identityMap = new Map(identities.map((i) => [i.id, i]));

  const existing = await prisma.employee.findMany({
    where: { companyId, identityId: { in: [...identityIdsWithWork] } },
    select: { identityId: true },
  });
  const existingSet = new Set(existing.map((e) => e.identityId));
  const needEmployee = [...identityIdsWithWork].filter(
    (identityId) => !existingSet.has(identityId),
  );

  if (needEmployee.length === 0) {
    console.log("All identities with WorkDayRecords already have an Employee record.");
    return;
  }

  const teamMemberRole = await prisma.role.findFirst({
    where: { companyId, name: "Team Member" },
    select: { id: true },
  });
  const defaultRoleId = teamMemberRole?.id;

  if (dryRun) {
    logDryRun(
      `Would create ${needEmployee.length} Employee(s) for identities with WorkDayRecords (no Employee yet).`,
    );
    needEmployee.forEach((identityId) => {
      const name = identityMap.get(identityId)?.name ?? "Unknown";
      logDryRun(`  - identityId=${identityId} (${name})`);
    });
    return;
  }

  for (const identityId of needEmployee) {
    const identity = identityMap.get(identityId);
    await prisma.employee.create({
      data: {
        identityId,
        companyId,
        name: identity?.name ?? "Employee",
        roleId: defaultRoleId ?? undefined,
        status: "active",
      },
    });
  }
  console.log(
    `Created ${needEmployee.length} Employee(s) for identities with WorkDayRecords (e.g. Admin/Manager).`,
  );
}

// ---------------------------------------------------------------------------
// 2.4 Migrate WorkDayRecord — set employeeId and companyId (from legacy identityId)
// ---------------------------------------------------------------------------

export async function taskMigrateWorkDayRecords(companyId: string): Promise<void> {
  const dryRun = isDryRun();
  const raw = await (
    prisma as unknown as {
      workDayRecord: { findRaw: (args: { filter: object }) => Promise<WorkDayRecordRaw[]> };
    }
  ).workDayRecord.findRaw({
    filter: {},
  });
  const arr = Array.isArray(raw) ? raw : [];
  const withLegacyIdentity = arr.filter((doc) => {
    const id = doc.identityId?.$oid ?? (doc as unknown as { identityId?: string }).identityId;
    return id != null;
  });

  if (withLegacyIdentity.length === 0) {
    const anyRecord = await prisma.workDayRecord.findFirst();
    if (anyRecord && !anyRecord.employeeId) {
      console.log(
        "WorkDayRecords exist but no legacy identityId found; ensure Employees exist and run migration.",
      );
    } else {
      console.log("No WorkDayRecords to migrate (or already migrated).");
    }
    return;
  }

  const employeeByIdentity = new Map<string, string>();
  const employees = await prisma.employee.findMany({
    where: { companyId },
    select: { id: true, identityId: true },
  });
  employees.forEach((e) => employeeByIdentity.set(e.identityId, e.id));

  const toUpdate: { recordId: string; identityId: string }[] = [];
  for (const doc of withLegacyIdentity) {
    const recordId = doc._id?.$oid ?? (doc as unknown as { _id: string })._id;
    const identityId =
      doc.identityId?.$oid ?? (doc as unknown as { identityId: string }).identityId;
    if (recordId && identityId && employeeByIdentity.has(identityId))
      toUpdate.push({ recordId, identityId });
  }

  if (toUpdate.length === 0) {
    console.log(
      "No WorkDayRecords could be linked to an Employee (missing Employee for identityId).",
    );
    return;
  }

  if (dryRun) {
    logDryRun(`Would set employeeId + companyId on ${toUpdate.length} WorkDayRecord(s).`);
    return;
  }

  for (const { recordId, identityId } of toUpdate) {
    const employeeId = employeeByIdentity.get(identityId)!;
    await prisma.workDayRecord.update({
      where: { id: recordId },
      data: { employeeId, companyId },
    });
  }
  console.log(`Updated employeeId and companyId on ${toUpdate.length} WorkDayRecord(s).`);
}

// ---------------------------------------------------------------------------
// 2.5 Migrate SaleReport — set companyId (use findRaw; some docs may have null companyId in DB)
// ---------------------------------------------------------------------------

type SaleReportRaw = { _id: { $oid: string }; companyId?: string | null };

export async function taskMigrateSaleReports(companyId: string): Promise<void> {
  const dryRun = isDryRun();
  const raw = await (
    prisma as unknown as {
      saleReport: { findRaw: (args: { filter: object }) => Promise<SaleReportRaw[]> };
    }
  ).saleReport.findRaw({ filter: {} });
  const reports = Array.isArray(raw) ? raw : [];
  const toMigrate = reports.filter((r) => (r.companyId ?? "") !== companyId);
  if (toMigrate.length === 0) {
    console.log("No SaleReports need companyId migration.");
    return;
  }
  if (dryRun) {
    logDryRun(`Would set companyId=${companyId} on ${toMigrate.length} SaleReport(s).`);
    return;
  }
  for (const r of toMigrate) {
    const id = r._id?.$oid ?? (r as unknown as { _id: string })._id;
    if (!id) continue;
    await prisma.saleReport.update({
      where: { id },
      data: { companyId },
    });
  }
  console.log(`Updated companyId on ${toMigrate.length} SaleReport(s).`);
}

// ---------------------------------------------------------------------------
// 2.6 Migrate Expense — set companyId (use findRaw; some docs may have null companyId in DB)
// ---------------------------------------------------------------------------

type ExpenseRaw = { _id: { $oid: string }; companyId?: string | null };

export async function taskMigrateExpenses(companyId: string): Promise<void> {
  const dryRun = isDryRun();
  const raw = await (
    prisma as unknown as {
      expense: { findRaw: (args: { filter: object }) => Promise<ExpenseRaw[]> };
    }
  ).expense.findRaw({ filter: {} });
  const expenses = Array.isArray(raw) ? raw : [];
  const toMigrate = expenses.filter((r) => (r.companyId ?? "") !== companyId);
  if (toMigrate.length === 0) {
    console.log("No Expenses need companyId migration.");
    return;
  }
  if (dryRun) {
    logDryRun(`Would set companyId=${companyId} on ${toMigrate.length} Expense(s).`);
    return;
  }
  for (const r of toMigrate) {
    const id = r._id?.$oid ?? (r as unknown as { _id: string })._id;
    if (!id) continue;
    await prisma.expense.update({
      where: { id },
      data: { companyId },
    });
  }
  console.log(`Updated companyId on ${toMigrate.length} Expense(s).`);
}

// ---------------------------------------------------------------------------
// Main: run all tasks in order
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (isDryRun()) console.log("=== DRY RUN: no changes will be written ===\n");

  const companyId = await taskCreateDefaultCompany();
  if (!companyId && isDryRun()) {
    console.log("(Using placeholder companyId for dry-run remaining steps.)\n");
  }
  const id =
    companyId ??
    (
      await prisma.company.findUnique({
        where: { slug: DEFAULT_COMPANY.slug },
        select: { id: true },
      })
    )?.id;
  if (!id) {
    console.error("Cannot proceed: company does not exist and dry run did not create it.");
    process.exit(1);
  }

  // await taskMigrateStoreSettingsToCompanySettings(id);
  // await taskMigrateRoleToCompany(id);
  // await taskCreateOperators(id);
  // await taskCreateEmployees(id);
  // await taskCreateEmployeesForWorkDayRecords(id); // Admins/Managers with WorkDayRecords get an Employee so records can link
  // await taskMigrateWorkDayRecords(id);
  // await taskMigrateSaleReports(id);
  // await taskMigrateExpenses(id);

  if (isDryRun()) console.log("\n=== DRY RUN complete ===");
  else console.log("\nPhase 2 migration complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
