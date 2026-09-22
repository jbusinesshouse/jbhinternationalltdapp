import { apiRequest, apiUpload, filePartFromUri } from "@/lib/api";
import { compressProductImage } from "@/lib/compressImage";
import { isPreparedImageUri } from "@/lib/pickedImage";

export const MAX_REVIEW_IMAGES = 4;

export type ProductReview = {
  id: string;
  order_id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  rating: number;
  comment: string | null;
  image_urls: string[];
  created_at: string;
  buyer?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type ReviewEligibility = {
  canReview: boolean;
  alreadyReviewed: boolean;
  productId: string | null;
  sellerId: string | null;
  productName: string | null;
  reason?: string;
};

export type SubmitReviewInput = {
  orderId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  rating: number;
  comment: string | null;
  imageUris: string[];
};

export type UploadedReviewImage = {
  publicUrl: string;
  path: string;
};

/** Compress then upload review images via Express. */
export async function uploadReviewImage(
  uri: string,
  _buyerId: string,
  orderId: string
): Promise<UploadedReviewImage> {
  const uploadUri = isPreparedImageUri(uri)
    ? uri
    : (await compressProductImage(uri)).uri;

  const form = new FormData();
  form.append(
    "files",
    filePartFromUri(uploadUri, `review_${Date.now()}.jpg`) as any
  );
  form.append("orderId", orderId);

  const res = await apiUpload<{ images: { path: string; publicUrl: string }[] }>(
    "/uploads/review-images",
    form
  );

  const first = res.images?.[0];
  if (!first?.path || !first?.publicUrl) {
    throw new Error("Image upload failed");
  }

  return { publicUrl: first.publicUrl, path: first.path };
}

export async function removeReviewStoragePaths(_paths: string[]): Promise<void> {
  // Review-image delete is not exposed on the BFF; ignore cleanup failures.
}

/** Whether the current buyer can leave a review for this order. */
export async function getReviewEligibility(
  orderId: string,
  _buyerId?: string
): Promise<ReviewEligibility> {
  return apiRequest<ReviewEligibility>(`/reviews/eligibility/${orderId}`);
}

export async function fetchReviewsForProduct(
  productId: string,
  limit = 20
): Promise<ProductReview[]> {
  const res = await apiRequest<{ reviews: ProductReview[] }>(
    `/reviews/product/${productId}?limit=${limit}`,
    { auth: false }
  );
  return res.reviews ?? [];
}

export async function fetchProductRatingSummary(
  productId: string
): Promise<{ average: number; count: number }> {
  const res = await apiRequest<{
    rating: { average: number; count: number };
  }>(`/reviews/product/${productId}`, { auth: false });
  return res.rating ?? { average: 0, count: 0 };
}

export async function submitProductReview(
  input: SubmitReviewInput
): Promise<void> {
  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (input.imageUris.length > MAX_REVIEW_IMAGES) {
    throw new Error(`You can upload up to ${MAX_REVIEW_IMAGES} images`);
  }

  const imageUrls: string[] = [];

  for (const uri of input.imageUris) {
    const uploaded = await uploadReviewImage(
      uri,
      input.buyerId,
      input.orderId
    );
    imageUrls.push(uploaded.publicUrl);
  }

  await apiRequest("/reviews", {
    method: "POST",
    body: {
      orderId: input.orderId,
      productId: input.productId,
      sellerId: input.sellerId,
      rating: input.rating,
      comment: input.comment,
      imageUrls,
    },
  });
}
