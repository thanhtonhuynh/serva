import { prisma } from "@serva/database";
import { cache } from "react";
import "server-only";

export const getCompanySettings = cache(async (companyId: string) => {
  const settings = await prisma.companySettings.findUnique({
    where: { companyId },
  });

  if (!settings) throw new Error("Company settings not found");

  return settings;
});

export const getStartCash = cache(async (companyId: string) => {
  const settings = await getCompanySettings(companyId);
  return settings.startCash;
});

export const getActivePlatforms = cache(async (companyId: string): Promise<string[]> => {
  const settings = await getCompanySettings(companyId);
  return settings.activePlatforms;
});

export async function updateCompanySettings(
  companyId: string,
  data: { startCash?: number; activePlatforms?: string[] },
) {
  return prisma.companySettings.update({
    where: { companyId },
    data,
  });
}
