"use server";

import { platformAdminGuardWithRateLimit } from "@serva/auth/authorize";
import { createAdminUser, removeAdminUser, updateIdentity } from "@serva/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateIdentitySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(200),
  accountStatus: z.enum(["active", "inactive", "suspended"]),
});

export type UpdateIdentityInput = z.infer<typeof UpdateIdentitySchema>;

export async function updateIdentityAction(
  identityId: string,
  data: UpdateIdentityInput,
): Promise<{ error?: string }> {
  await platformAdminGuardWithRateLimit();

  const parsed = UpdateIdentitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await updateIdentity(identityId, parsed.data);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint"))
      return { error: "An identity with this email already exists." };
    throw err;
  }

  revalidatePath(`/identities/${identityId}`);
  revalidatePath("/identities");
  return {};
}

export async function promoteToPlatformAdminAction(
  identityId: string,
): Promise<{ error?: string }> {
  await platformAdminGuardWithRateLimit();

  await createAdminUser(identityId);

  revalidatePath(`/identities/${identityId}`);
  revalidatePath("/identities");
  return {};
}

export async function demoteFromPlatformAdminAction(
  identityId: string,
): Promise<{ error?: string }> {
  await platformAdminGuardWithRateLimit();

  try {
    await removeAdminUser(identityId);
  } catch {
    return { error: "Failed to remove admin status." };
  }

  revalidatePath(`/identities/${identityId}`);
  revalidatePath("/identities");
  return {};
}
