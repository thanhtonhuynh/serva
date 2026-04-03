import { del, put } from "@vercel/blob";

const BLOB_ENV_FOLDER = process.env.VERCEL_ENV === "production" ? "prod" : "dev";

export async function uploadImage(image: File): Promise<string> {
  const filename = `${BLOB_ENV_FOLDER}/avatars/${image.name}`;
  const blob = await put(filename, image, {
    access: "public",
    addRandomSuffix: true,
    contentType: image.type,
  });
  return blob.url;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl.includes("blob.vercel-storage.com")) {
    return;
  }
  await del(imageUrl);
}
