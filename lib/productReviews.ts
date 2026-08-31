import { compressProductImage } from "@/lib/compressImage";
import { isPreparedImageUri } from "@/lib/pickedImage";
import { supabase } from "@/lib/supabase";

const BUCKET = "review-images";
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

/** Compress then upload a local image URI to the review-images bucket. */
export async function uploadReviewImage(
  uri: string,
  buyerId: string,
  orderId: string
): Promise<UploadedReviewImage> {
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

  const path = `${buyerId}/${orderId}/${Date.now()}_${Math.random()
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

export async function removeReviewStoragePaths(paths: string[]): Promise<void> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return;

  const { error } = await supabase.storage.from(BUCKET).remove(unique);
  if (error && __DEV__) {
    console.warn("[productReviews] storage cleanup failed:", error);
  }
}

/** Whether the current buyer can leave a review for this order. */
export async function getReviewEligibility(
  orderId: string,
  buyerId: string
): Promise<ReviewEligibility> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      user_id,
      product_id,
      products (
        id,
        seller_id,
        name
      )
    `
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) throw orderError;

  if (!order || order.user_id !== buyerId) {
    return {
      canReview: false,
      alreadyReviewed: false,
      productId: null,
      sellerId: null,
      productName: null,
      reason: "Order not found",
    };
  }

  const product = Array.isArray(order.products)
    ? order.products[0]
    : order.products;

  const productId = (product?.id as string) ?? (order.product_id as string);
  const sellerId = (product?.seller_id as string) ?? null;
  const productName = (product?.name as string) ?? null;

  if (String(order.status).toLowerCase() !== "completed") {
    return {
      canReview: false,
      alreadyReviewed: false,
      productId,
      sellerId,
      productName,
      reason: "Order is not completed yet",
    };
  }

  const { data: existing, error: reviewError } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (reviewError) throw reviewError;

  if (existing) {
    return {
      canReview: false,
      alreadyReviewed: true,
      productId,
      sellerId,
      productName,
      reason: "Already reviewed",
    };
  }

  if (!sellerId) {
    return {
      canReview: false,
      alreadyReviewed: false,
      productId,
      sellerId: null,
      productName,
      reason: "Seller not found",
    };
  }

  return {
    canReview: true,
    alreadyReviewed: false,
    productId,
    sellerId,
    productName,
  };
}

export async function fetchReviewsForProduct(
  productId: string,
  limit = 20
): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select(
      `
      id,
      order_id,
      product_id,
      buyer_id,
      seller_id,
      rating,
      comment,
      image_urls,
      created_at,
      buyer:profiles!buyer_id (
        full_name,
        avatar_url
      )
    `
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    ...row,
    image_urls: Array.isArray(row.image_urls) ? row.image_urls : [],
    buyer: Array.isArray(row.buyer) ? row.buyer[0] : row.buyer,
  })) as ProductReview[];
}

export async function fetchProductRatingSummary(
  productId: string
): Promise<{ average: number; count: number }> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error) throw error;

  const ratings = (data ?? []).map((r) => Number(r.rating)).filter(Boolean);
  if (!ratings.length) return { average: 0, count: 0 };

  const sum = ratings.reduce((a, b) => a + b, 0);
  return {
    average: Math.round((sum / ratings.length) * 10) / 10,
    count: ratings.length,
  };
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

  const uploadedPaths: string[] = [];
  const imageUrls: string[] = [];

  try {
    for (const uri of input.imageUris) {
      const uploaded = await uploadReviewImage(
        uri,
        input.buyerId,
        input.orderId
      );
      uploadedPaths.push(uploaded.path);
      imageUrls.push(uploaded.publicUrl);
    }

    const { error } = await supabase.from("product_reviews").insert({
      order_id: input.orderId,
      product_id: input.productId,
      buyer_id: input.buyerId,
      seller_id: input.sellerId,
      rating: input.rating,
      comment: input.comment,
      image_urls: imageUrls,
    });

    if (error) throw error;
  } catch (err) {
    await removeReviewStoragePaths(uploadedPaths);
    throw err;
  }
}
