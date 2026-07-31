import {
  fisherYatesShuffle,
  formatProducts,
  ProductFeedItem,
} from "@/lib/productFeed";
import { supabase } from "@/lib/supabase";

/** Max sponsored products when browsing all products (random 20–30). */
export const AD_FEED_ALL_MAX = 30;
export const AD_FEED_ALL_MIN = 20;
/** Max sponsored products inside a selected category/subcategory. */
export const AD_FEED_CATEGORY_MAX = 20;

export type AdvertisedProduct = ProductFeedItem & {
  isSponsored: true;
};

type FetchActiveAdvertisedProductsOptions = {
  categoryId?: string;
  subcategoryId?: string;
  blockedUserIds?: string[];
  /** Override shuffle cap; otherwise uses all vs category defaults. */
  limit?: number;
};

function resolveLimit(
  categoryId: string | undefined,
  explicit?: number
): number {
  if (typeof explicit === "number" && explicit > 0) return explicit;
  if (categoryId) return AD_FEED_CATEGORY_MAX;
  // Random 20–30 each refresh for the all-products feed
  return (
    AD_FEED_ALL_MIN +
    Math.floor(Math.random() * (AD_FEED_ALL_MAX - AD_FEED_ALL_MIN + 1))
  );
}

/**
 * Active advertised product IDs within the current time window,
 * optionally filtered by category / subcategory, then shuffled + capped.
 */
export async function fetchActiveAdvertisedProducts(
  options: FetchActiveAdvertisedProductsOptions = {}
): Promise<AdvertisedProduct[]> {
  const {
    categoryId,
    subcategoryId,
    blockedUserIds = [],
    limit: explicitLimit,
  } = options;

  const now = new Date().toISOString();
  const limit = resolveLimit(categoryId, explicitLimit);

  const { data: adRows, error: adError } = await supabase
    .from("product_ads")
    .select("product_id")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now);

  if (adError) throw adError;
  if (!adRows?.length) return [];

  const uniqueIds = [
    ...new Set(
      adRows
        .map((row) => row.product_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];

  if (uniqueIds.length === 0) return [];

  let productQuery = supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      moq,
      seller_id,
      category_id,
      subcategory_id,
      product_images (
        image_url,
        is_main
      )
    `
    )
    .in("id", uniqueIds)
    .eq("is_deleted", false)
    .eq("status", "active");

  if (categoryId) {
    productQuery = productQuery.eq("category_id", categoryId);
  }
  if (subcategoryId) {
    productQuery = productQuery.eq("subcategory_id", subcategoryId);
  }

  const { data: products, error: productsError } = await productQuery;
  if (productsError) throw productsError;
  if (!products?.length) return [];

  const shuffled = fisherYatesShuffle(products).slice(0, limit);
  const formatted = formatProducts(shuffled, blockedUserIds);

  return formatted.map((item) => ({ ...item, isSponsored: true as const }));
}
