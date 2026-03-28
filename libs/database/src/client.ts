import { PrismaClient } from "../generated/prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    omit: {
      identity: {
        passwordHash: true,
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
