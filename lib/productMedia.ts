import { compressProductImage } from "@/lib/compressImage";
import { isPreparedImageUri } from "@/lib/pickedImage";
import { supabase } from "@/lib/supabase";

const BUCKET = "product-images";

/** Strip HTML to plain text for empty-description checks. */
export function plainTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parsePositiveNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function parsePositiveInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export type UploadedProductImage = {
  publicUrl: string;
  path: string;
};

/**
 * Compress then upload a local image URI to the product-images bucket.
 * Throws on failure (callers should treat as hard error).
 */
export async function uploadProductImage(
  uri: string,
  folder: string
): Promise<UploadedProductImage> {
  const uploadUri = isPreparedImageUri(uri)
    ? uri
    : (await compressProductImage(uri)).uri;

  const response = await fetch(uploadUri);
  if (!response.ok) {
    throw new Error("Failed to read compressed image");
  }

  const arrayBuffer = await response.arrayBuffer();
  if (!arrayBuffer.byteLength) {
    throw new Error("Image file is empty");
  }

  const path = `${folder}/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}.jpg`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error || !data?.path) {
    throw new Error(error?.message || "Image upload failed");
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return { publicUrl: urlData.publicUrl, path: data.path };
}

export function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
  } catch {
    return publicUrl.slice(idx + marker.length);
  }
}

export async function removeProductStoragePaths(
  paths: string[]
): Promise<void> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return;

  const { error } = await supabase.storage.from(BUCKET).remove(unique);
  if (error && __DEV__) {
    console.warn("[productMedia] storage cleanup failed:", error);
  }
}

/** Soft-delete a product after a failed multi-step create. */
export async function softDeleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_deleted: true, active: false })
    .eq("id", productId);

  if (error && __DEV__) {
    console.warn("[productMedia] soft-delete failed:", error);
  }
}
