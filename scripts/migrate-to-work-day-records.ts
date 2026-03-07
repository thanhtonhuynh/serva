/**
 * Migration script: Convert SaleReport.shifts to WorkDayRecord
 *
 * Usage: npx tsx scripts/migrate-to-work-day-records.ts
 */

import { PrismaClient, Shift } from "@prisma/client";

const prisma = new PrismaClient();

function startOfDayUTC(d: Date): Date {
  const d2 = new Date(d);
  d2.setUTCHours(0, 0, 0, 0);
  return d2;
}

async function migrateFromSaleReportShifts() {
  console.log("Starting migration from SaleReport.shifts to WorkDayRecord...");

  const reports = await prisma.saleReport.findMany({
    where: {
      // Only reports that still have shifts data
      shifts: {
        some: {},
      },
    },
    select: {
      id: true,
      date: true,
      shifts: true,
    },
    orderBy: { date: "asc" },
  });

  console.log(`Found ${reports.length} sale reports with shifts.`);

  const totalShifts = reports.reduce((sum, r) => sum + (r.shifts as Shift[]).length, 0);
  console.log(`Total shifts in reports (before migration): ${totalShifts}`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const report of reports) {
    const dayStart = startOfDayUTC(report.date);

    // Group shifts by userId in case there are multiple entries for the same user
    const shiftsByUser = new Map<string, { hours: number; tips: number }>();

    for (const shift of report.shifts as Shift[]) {
      const existing = shiftsByUser.get(shift.userId) ?? { hours: 0, tips: 0 };
      shiftsByUser.set(shift.userId, {
        hours: existing.hours + shift.hours,
        tips: existing.tips + shift.tips,
      });
    }

    for (const [userId, { hours, tips }] of shiftsByUser.entries()) {
      const existingRecord = await prisma.workDayRecord.findUnique({
        where: {
          date_userId: {
            date: dayStart,
            userId,
          },
        },
      });

      if (existingRecord) {
        await prisma.workDayRecord.update({
          where: { id: existingRecord.id },
          data: {
            // Historical data has no slot detail, so we leave shifts as-is
            // and just update totalHours and tips.
            totalHours: hours,
            tips,
          },
        });
        updatedCount += 1;
      } else {
        await prisma.workDayRecord.create({
          data: {
            date: dayStart,
            userId,
            shifts: [],
            totalHours: hours,
            tips,
          },
        });
        createdCount += 1;
      }
    }
  }

  console.log(
    `Migration complete. Created ${createdCount} WorkDayRecord records, updated ${updatedCount} existing records.`,
  );
}

async function main() {
  try {
    // No ScheduleDay data in production per requirements, so we only migrate from SaleReport.shifts
    await migrateFromSaleReportShifts();
  } catch (error) {
    console.error("Error during migration:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
