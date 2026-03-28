"use server";

import {
  getIdentityByEmail,
  getIdentityPasswordHash,
  updateIdentity,
  updateIdentityPassword,
} from "@serva/database";
import { authorizeAction } from "@/lib/auth/authorize";
import { verifyPassword } from "@/lib/auth/password";
import { invalidateIdentitySessionsExceptCurrent } from "@/lib/auth/session";
import {
  UpdateAvatarSchema,
  UpdateAvatarSchemaInput,
  UpdateEmailSchema,
  UpdateEmailSchemaInput,
  UpdateNameSchema,
  UpdateNameSchemaInput,
  UpdatePasswordSchema,
  UpdatePasswordSchemaInput,
} from "@/lib/validations/auth";
import { deleteImage, uploadImage } from "@/lib/vercel-blob/storage";
import { revalidatePath } from "next/cache";

// Update name
export async function updateNameAction(data: UpdateNameSchemaInput): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    const { identity } = authResult;

    const { name } = UpdateNameSchema.parse(data);

    await updateIdentity(identity.id, { name });

    revalidatePath("/");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Update name failed. Please try again." };
  }
}

// Update email
export async function updateEmailAction(data: UpdateEmailSchemaInput): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    const { identity } = authResult;

    const { email } = UpdateEmailSchema.parse(data);

    if (email === identity.email) {
      return {};
    }

    const existingEmail = await getIdentityByEmail(email);
    if (existingEmail) {
      return { error: "Email already in use." };
    }

    await updateIdentity(identity.id, { email });

    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: "Update email failed. Please try again." };
  }
}

// Update password
export async function updatePasswordAction(
  data: UpdatePasswordSchemaInput,
): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    const { identity, session } = authResult;

    const { currentPassword, newPassword, logOutOtherDevices } = UpdatePasswordSchema.parse(data);

    const passwordHash = await getIdentityPasswordHash(identity.id);
    if (!passwordHash) {
      return { error: "Invalid credentials." };
    }

    if (!(await verifyPassword(passwordHash, currentPassword))) {
      return { error: "Incorrect password." };
    }

    await updateIdentityPassword(identity.id, newPassword);

    if (logOutOtherDevices) {
      await invalidateIdentitySessionsExceptCurrent(identity.id, session.id);
    }

    return {};
  } catch (error) {
    return { error: "Update password failed. Please try again." };
  }
}

// Update avatar
export async function updateAvatarAction(
  data: UpdateAvatarSchemaInput,
): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    const { identity, session } = authResult;

    const { image } = UpdateAvatarSchema.parse(data);

    if (identity.image) {
      await deleteImage(identity.image);
    }

    const imageUrl = await uploadImage(image);

    await updateIdentity(identity.id, { image: imageUrl });

    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: "Update avatar failed. Please try again." };
  }
}
