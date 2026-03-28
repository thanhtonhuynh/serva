import { hash, verify } from "@node-rs/argon2";

export async function hashPassword(plainTextPassword: string) {
  return await hash(plainTextPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function verifyPassword(passwordHash: string, plainTextPassword: string) {
  return await verify(passwordHash, plainTextPassword);
}
