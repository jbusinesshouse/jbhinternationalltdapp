import * as ImageManipulator from "expo-image-manipulator";

/** Default upload budget — keeps storage lean without heavy pixelation. */
export const DEFAULT_TARGET_BYTES = 100 * 1024; // 100KB

export type CompressImageOptions = {
  /** Soft ceiling for output size in bytes. Default: 100KB. */
  targetBytes?: number;
  /** Longest side after first resize. Default: 1280 (products). */
  maxDimension?: number;
  /** Don't shrink the long side below this. Default: 720. */
  minDimension?: number;
};

export type CompressedImage = {
  uri: string;
  width: number;
  height: number;
  byteSize: number;
};

async function getUriByteSize(uri: string): Promise<number> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error("Failed to read image for size check");
  }
  const buffer = await response.arrayBuffer();
  return buffer.byteLength;
}

function resizeActions(
  width: number,
  height: number,
  maxDimension: number
): ImageManipulator.Action[] {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return [];

  if (width >= height) {
    return [{ resize: { width: maxDimension } }];
  }
  return [{ resize: { height: maxDimension } }];
}

/**
 * Compress a local image toward ~targetBytes using JPEG + progressive
 * quality/dimension reduction. Stops before aggressive pixelation.
 *
 * Always outputs JPEG for consistent storage content-type.
 */
export async function compressImageForUpload(
  uri: string,
  options: CompressImageOptions = {}
): Promise<CompressedImage> {
  const targetBytes = options.targetBytes ?? DEFAULT_TARGET_BYTES;
  const minDimension = options.minDimension ?? 720;
  let maxDimension = options.maxDimension ?? 1280;

  // Quality ladder — floor ~0.4 so images stay usable on product cards
  const qualities = [0.72, 0.64, 0.56, 0.48, 0.4];

  // Probe current dimensions with a no-op manipulate (also normalizes HEIC/etc.)
  let probe = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 1,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  let best: CompressedImage = {
    uri: probe.uri,
    width: probe.width,
    height: probe.height,
    byteSize: await getUriByteSize(probe.uri),
  };

  // Already small enough — still return JPEG-normalized file
  if (best.byteSize <= targetBytes) {
    return best;
  }

  while (maxDimension >= minDimension) {
    for (const quality of qualities) {
      const actions = resizeActions(probe.width, probe.height, maxDimension);
      const result = await ImageManipulator.manipulateAsync(uri, actions, {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      const byteSize = await getUriByteSize(result.uri);

      if (byteSize < best.byteSize) {
        best = {
          uri: result.uri,
          width: result.width,
          height: result.height,
          byteSize,
        };
      }

      if (byteSize <= targetBytes) {
        if (__DEV__) {
          console.log(
            `[compressImage] ${Math.round(byteSize / 1024)}KB @ q=${quality}, ${result.width}x${result.height}`
          );
        }
        return best;
      }
    }

    // Still too large — shrink canvas a bit more, keep quality floor
    const next = Math.floor(maxDimension * 0.85);
    if (next < minDimension || next >= maxDimension) break;
    maxDimension = next;
  }

  if (__DEV__) {
    console.warn(
      `[compressImage] Could not reach ${Math.round(targetBytes / 1024)}KB; best=${Math.round(best.byteSize / 1024)}KB`
    );
  }

  return best;
}

/** Avatar / logo: slightly smaller canvas is enough. */
export function compressAvatarImage(uri: string) {
  return compressImageForUpload(uri, {
    targetBytes: DEFAULT_TARGET_BYTES,
    maxDimension: 800,
    minDimension: 480,
  });
}

/** Product gallery photos. */
export function compressProductImage(uri: string) {
  return compressImageForUpload(uri, {
    targetBytes: DEFAULT_TARGET_BYTES,
    maxDimension: 1280,
    minDimension: 720,
  });
}
