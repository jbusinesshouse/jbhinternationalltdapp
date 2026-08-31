import {
  compressAvatarImage,
  compressProductImage,
  type CompressedImage,
} from "@/lib/compressImage";
import * as FileSystem from "expo-file-system/legacy";

export const PICKED_IMAGES_DIR = "jbh-picked-images";

function stagingRoot(): string {
  const root = FileSystem.documentDirectory;
  if (!root) {
    throw new Error("Local storage is not available on this device");
  }
  return `${root}${PICKED_IMAGES_DIR}/`;
}

let stagingDirReady = false;

async function ensureStagingDir(): Promise<void> {
  if (stagingDirReady) return;

  const dir = stagingRoot();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  stagingDirReady = true;
}

function uniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function newStagingPath(ext = "jpg"): string {
  return `${stagingRoot()}${uniqueId()}.${ext}`;
}

export function isPreparedImageUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  return uri.includes(`/${PICKED_IMAGES_DIR}/`);
}

async function verifyReadableFile(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || (info.size !== undefined && info.size === 0)) {
    throw new Error("Selected image is no longer available");
  }
}

async function copyToStaging(pickerUri: string): Promise<string> {
  await ensureStagingDir();
  const dest = newStagingPath("jpg");
  await FileSystem.copyAsync({ from: pickerUri, to: dest });
  await verifyReadableFile(dest);
  return dest;
}

async function finalizeCompressedToStaging(
  compressed: CompressedImage,
  rawStagingUris: string[]
): Promise<CompressedImage> {
  let finalUri = compressed.uri;

  if (!isPreparedImageUri(finalUri)) {
    const dest = newStagingPath("jpg");
    await FileSystem.copyAsync({ from: compressed.uri, to: dest });
    finalUri = dest;
  }

  await verifyReadableFile(finalUri);

  const cleanup = [...rawStagingUris];
  if (compressed.uri !== finalUri) {
    cleanup.push(compressed.uri);
  }
  await deleteLocalImageUris(cleanup);

  return { ...compressed, uri: finalUri };
}

async function preparePickedImage(
  pickerUri: string,
  compress: (uri: string) => Promise<CompressedImage>
): Promise<CompressedImage> {
  const staged = await copyToStaging(pickerUri);
  try {
    const compressed = await compress(staged);
    return await finalizeCompressedToStaging(compressed, [staged]);
  } catch (error) {
    await deleteLocalImageUris([staged]);
    throw error;
  }
}

/** Copy + compress a product photo immediately after gallery pick. */
export async function preparePickedProductImage(
  pickerUri: string
): Promise<CompressedImage> {
  return preparePickedImage(pickerUri, compressProductImage);
}

/** Process multiple picks one-by-one to reduce memory pressure on older devices. */
export async function preparePickedProductImages(
  pickerUris: string[]
): Promise<CompressedImage[]> {
  const prepared: CompressedImage[] = [];
  for (const uri of pickerUris) {
    prepared.push(await preparePickedProductImage(uri));
  }
  return prepared;
}

/** Copy + compress an avatar immediately after gallery pick. */
export async function preparePickedAvatarImage(
  pickerUri: string
): Promise<CompressedImage> {
  return preparePickedImage(pickerUri, compressAvatarImage);
}

/** Delete app-owned local image files (safe no-op for remote URLs). */
export async function deleteLocalImageUris(
  uris: (string | null | undefined)[]
): Promise<void> {
  for (const uri of [...new Set(uris.filter(Boolean) as string[])]) {
    if (!uri.startsWith("file://") || !isPreparedImageUri(uri)) continue;

    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      // Best-effort cleanup only.
    }
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isImageProcessingError(error: unknown): boolean {
  const lower = errorMessage(error).toLowerCase();
  return (
    lower.includes("loading bitmap failed") ||
    lower.includes("could not load the image") ||
    lower.includes("renderasync") ||
    lower.includes("no longer available") ||
    lower.includes("failed to read compressed image") ||
    lower.includes("image file is empty") ||
    lower.includes("image copy failed")
  );
}

export function formatImageProcessingError(error: unknown): string {
  const message = errorMessage(error);
  const lower = message.toLowerCase();

  if (
    lower.includes("loading bitmap failed") ||
    lower.includes("could not load the image") ||
    lower.includes("no longer available")
  ) {
    return "নির্বাচিত ছবি প্রক্রিয়া করা যায়নি। অনুগ্রহ করে আবার ছবি বাছুন বা অন্য ছবি ব্যবহার করুন।";
  }

  if (
    lower.includes("local storage") ||
    lower.includes("not enough") ||
    lower.includes("no space")
  ) {
    return "ডিভাইসে পর্যাপ্ত স্টোরেজ নেই। কিছু জায়গা খালি করে আবার চেষ্টা করুন।";
  }

  return "ছবি প্রক্রিয়া করা যায়নি। আবার চেষ্টা করুন।";
}

export function formatUploadError(error: unknown, fallback: string): string {
  return isImageProcessingError(error)
    ? formatImageProcessingError(error)
    : errorMessage(error) || fallback;
}
