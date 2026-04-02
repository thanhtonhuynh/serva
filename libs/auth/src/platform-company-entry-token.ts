import { createHmac, timingSafeEqual } from "node:crypto";
import "server-only";

const SECRET_ENV = "PLATFORM_COMPANY_IMPERSONATION_SECRET";

/** Short window so the same URL is not useful if leaked. */
const TOKEN_TTL_SEC = 5 * 60;

function getSecret(): string | null {
  const s = process.env[SECRET_ENV]?.trim();
  return s && s.length > 0 ? s : null;
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Mint a token for `/platform/impersonate?token=...` (admin → auth redirect).
 * Requires `PLATFORM_COMPANY_IMPERSONATION_SECRET` (same value on admin + auth).
 */
export function createPlatformCompanyEntryToken(companyId: string): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error(`${SECRET_ENV} must be set to generate company entry tokens`);
  }
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC;
  const payload = `${companyId}.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  const enc = Buffer.from(payload, "utf8").toString("base64url");
  return `${enc}.${sig}`;
}

/**
 * Returns company id if the token is valid and not expired; otherwise null.
 */
export function verifyPlatformCompanyEntryToken(token: string): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const enc = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!enc || !sig) return null;

  let payload: string;
  try {
    payload = Buffer.from(enc, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const lastDot = payload.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const companyId = payload.slice(0, lastDot);
  const expRaw = payload.slice(lastDot + 1);
  const exp = Number(expRaw);
  if (!companyId || !/^[a-f0-9]{24}$/i.test(companyId) || !Number.isFinite(exp)) {
    return null;
  }
  if (exp < Math.floor(Date.now() / 1000)) return null;

  const expectedSig = createHmac("sha256", secret).update(payload).digest("base64url");
  if (!timingSafeStringEqual(sig, expectedSig)) return null;

  return companyId;
}
