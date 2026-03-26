import prisma from "@/lib/prisma";
import { cache } from "react";
import "server-only";

export const getJobsByCompany = cache(async (companyId: string) => {
  return prisma.job.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });
});

export async function createJob(companyId: string, name: string) {
  return prisma.job.create({
    data: { companyId, name: name.trim() },
  });
}

export async function updateJobName(jobId: string, companyId: string, name: string) {
  return prisma.job.updateMany({
    where: { id: jobId, companyId },
    data: { name: name.trim() },
  });
}
