import prisma from "@/lib/prisma";
import { StoreSettings } from "@prisma/client";
import { cache } from "react";
import "server-only";

// export const getShiftHours = cache(async () => {
//   const storeSettings = await prisma.storeSettings.findFirst();

//   if (!storeSettings) {
//     throw new Error("Store settings not found");
//   }

//   return {
//     monday: storeSettings.mondayShift,
//     tuesday: storeSettings.tuesdayShift,
//     wednesday: storeSettings.wednesdayShift,
//     thursday: storeSettings.thursdayShift,
//     friday: storeSettings.fridayShift,
//     saturday: storeSettings.saturdayShift,
//     sunday: storeSettings.sundayShift,
//   };
// });

// export const getFullDayHours = cache(async (day: string) => {
//   const storeSettings = await prisma.storeSettings.findFirst();

//   if (!storeSettings) {
//     throw new Error("Store settings not found");
//   }

//   if (day === "monday") return storeSettings.mondayShift;
//   if (day === "tuesday") return storeSettings.tuesdayShift;
//   if (day === "wednesday") return storeSettings.wednesdayShift;
//   if (day === "thursday") return storeSettings.thursdayShift;
//   if (day === "friday") return storeSettings.fridayShift;
//   if (day === "saturday") return storeSettings.saturdayShift;
//   return storeSettings.sundayShift;
// });

export const getStartCash = cache(async () => {
  const storeSettings = await prisma.storeSettings.findFirst();

  if (!storeSettings) {
    throw new Error("Store settings not found");
  }

  return storeSettings.startCash;
});

export const getActivePlatforms = cache(async (): Promise<string[]> => {
  const storeSettings = await prisma.storeSettings.findFirst();

  if (!storeSettings) {
    throw new Error("Store settings not found");
  }

  return storeSettings.activePlatforms;
});

export async function updateStoreSettings(data: Partial<StoreSettings>) {
  const storeSettings = await prisma.storeSettings.findFirst();

  if (!storeSettings) {
    throw new Error("Store settings not found");
  }

  return prisma.storeSettings.update({
    where: { id: storeSettings.id },
    data,
  });
}
