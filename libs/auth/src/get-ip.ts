import { headers } from "next/headers";

export async function getIp() {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const realIp = (await headers()).get("x-real-ip");

  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    return first?.trim() ?? null;
  }

  if (realIp) {
    return realIp.trim();
  }

  return null;
}
