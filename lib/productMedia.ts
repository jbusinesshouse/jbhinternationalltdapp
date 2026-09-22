import { apiRequest, apiUpload, filePartFromUri } from "@/lib/api";
import { compressProductImage } from "@/lib/compressImage";
import { isPreparedImageUri } from "@/lib/pickedImage";

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

function productIdFromFolder(folder?: string): string | null {
  if (!folder) return null;
  const match = folder.match(
    /products\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  );
  return match?.[1] ?? null;
}

/**
 * Compress then upload via Express `/uploads/product-image`.
 * `folder` may contain `products/{productId}/...` — productId is sent when present.
 */
export async function uploadProductImage(
  uri: string,
  folder?: string
): Promise<UploadedProductImage> {
  const uploadUri = isPreparedImageUri(uri)
    ? uri
    : (await compressProductImage(uri)).uri;

  const form = new FormData();
  form.append(
    "file",
    filePartFromUri(uploadUri, `product_${Date.now()}.jpg`) as any
  );

  const productId = productIdFromFolder(folder);
  if (productId) {
    form.append("productId", productId);
  }

  const uploaded = await apiUpload<{ path: string; publicUrl: string }>(
    "/uploads/product-image",
    form
  );

  if (!uploaded?.path || !uploaded?.publicUrl) {
    throw new Error("Image upload failed");
  }

  return { publicUrl: uploaded.publicUrl, path: uploaded.path };
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

  try {
    await apiRequest("/uploads/product-images", {
      method: "DELETE",
      body: { paths: unique },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn("[productMedia] storage cleanup failed:", error);
    }
  }
}

/** Soft-delete a product after a failed multi-step create. */
export async function softDeleteProduct(productId: string): Promise<void> {
  try {
    await apiRequest(`/products/${productId}`, { method: "DELETE" });
  } catch (error) {
    if (__DEV__) {
      console.warn("[productMedia] soft-delete failed:", error);
    }
  }
}
