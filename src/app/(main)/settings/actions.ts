"use server";

import {
  getUserByEmail,
  getUserByUsername,
  getUserPasswordHash,
  updateUser,
  updateUserPassword,
} from "@/data-access/user";
import { verifyPassword } from "@/lib/auth/password";
import { getCurrentSession, invalidateUserSessionsExceptCurrent } from "@/lib/auth/session";
import {
  UpdateAvatarSchema,
  UpdateAvatarSchemaInput,
  UpdateEmailSchema,
  UpdateEmailSchemaInput,
  UpdateNameSchema,
  UpdateNameSchemaInput,
  UpdatePasswordSchema,
  UpdatePasswordSchemaInput,
  UpdateUsernameSchema,
  UpdateUsernameSchemaInput,
} from "@/lib/validations/auth";
import { deleteImage, uploadImage } from "@/lib/vercel-blob/storage";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { revalidatePath } from "next/cache";

// Update name
export async function updateNameAction(data: UpdateNameSchemaInput) {
  try {
    const { user } = await getCurrentSession();
    if (!user || user.accountStatus !== "active") {
      return { error: "Unauthorized." };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    const { name } = UpdateNameSchema.parse(data);

    await updateUser(user.id, { name });

    revalidatePath("/");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Update name failed. Please try again." };
  }
}

// Update username
export async function updateUsernameAction(data: UpdateUsernameSchemaInput) {
  try {
    const { user } = await getCurrentSession();
    if (!user || user.accountStatus !== "active") {
      return { error: "Unauthorized." };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    const { username } = UpdateUsernameSchema.parse(data);

    if (username === user.username) {
      return {};
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return { error: "Username already in use." };
    }

    await updateUser(user.id, { username });

    revalidatePath("/");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Update username failed. Please try again." };
  }
}

// Update email
export async function updateEmailAction(data: UpdateEmailSchemaInput) {
  try {
    const { user } = await getCurrentSession();
    if (!user || user.accountStatus !== "active") {
      return { error: "Unauthorized." };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    const { email } = UpdateEmailSchema.parse(data);

    if (email === user.email) {
      return {};
    }

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return { error: "Email already in use." };
    }

    await updateUser(user.id, { email });

    revalidatePath("/");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Update email failed. Please try again." };
  }
}

// Update password
export async function updatePasswordAction(data: UpdatePasswordSchemaInput) {
  try {
    const { session, user } = await getCurrentSession();
    if (!user || user.accountStatus !== "active") {
      return { error: "Unauthorized." };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    const { currentPassword, newPassword, logOutOtherDevices } = UpdatePasswordSchema.parse(data);

    const passwordHash = await getUserPasswordHash(user.id);
    if (!passwordHash) {
      return { error: "Invalid credentials." };
    }

    if (!(await verifyPassword(passwordHash, currentPassword))) {
      return { error: "Incorrect password." };
    }

    await updateUserPassword(user.id, newPassword);

    if (logOutOtherDevices) {
      await invalidateUserSessionsExceptCurrent(user.id, session.id);
    }

    return {};
  } catch (error) {
    console.error(error);
    return { error: "Update password failed. Please try again." };
  }
}

// Update avatar
export async function updateAvatarAction(data: UpdateAvatarSchemaInput) {
  try {
    const { user } = await getCurrentSession();
    if (!user || user.accountStatus !== "active") {
      return { error: "Unauthorized." };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    const { image } = UpdateAvatarSchema.parse(data);

    if (user.image) {
      await deleteImage(user.image);
    }

    const imageUrl = await uploadImage(image);

    await updateUser(user.id, { image: imageUrl });

    revalidatePath("/");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Update avatar failed. Please try again." };
  }
}
