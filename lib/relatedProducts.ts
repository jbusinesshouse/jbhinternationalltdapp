import {
  fisherYatesShuffle,
  formatProducts,
  ProductFeedItem,
} from "@/lib/productFeed";
import { supabase } from "@/lib/supabase";
import {
  AdvertisedProduct,
  fetchActiveAdvertisedProducts,
} from "@/lib/productAds";

export const RELATED_AD_LIMIT = 12;
export const RELATED_ORGANIC_LIMIT = 12;

export type RelatedProductsResult = {
  sponsored: AdvertisedProduct[];
  organic: ProductFeedItem[];
};

/**
 * Related products for a product detail page:
 * 1) shuffled active ads in the same category (excluding the open product)
 * 2) shuffled non-ad products in the same category
 */
export async function fetchRelatedProducts(options: {
  productId: string;
  categoryId: string;
  blockedUserIds?: string[];
}): Promise<RelatedProductsResult> {
  const { productId, categoryId, blockedUserIds = [] } = options;

  if (!categoryId || !productId) {
    return { sponsored: [], organic: [] };
  }

  const sponsoredRaw = await fetchActiveAdvertisedProducts({
    categoryId,
    blockedUserIds,
    limit: RELATED_AD_LIMIT + 4, // fetch a few extras in case we drop current
  });

  const sponsored = sponsoredRaw
    .filter((p) => p.id !== productId)
    .slice(0, RELATED_AD_LIMIT);

  const sponsoredIds = new Set(sponsored.map((p) => p.id));
  sponsoredIds.add(productId);

  const { data: idRows, error: idError } = await supabase
    .from("products")
    .select("id")
    .eq("category_id", categoryId)
    .eq("is_deleted", false)
    .eq("status", "active");

  if (idError) throw idError;

  const organicIds = fisherYatesShuffle(
    (idRows ?? [])
      .map((row: { id: string }) => row.id)
      .filter((id: string) => !sponsoredIds.has(id))
  ).slice(0, RELATED_ORGANIC_LIMIT);

  if (organicIds.length === 0) {
    return { sponsored, organic: [] };
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      moq,
      seller_id,
      product_images (
        image_url,
        is_main
      )
    `
    )
    .in("id", organicIds)
    .eq("is_deleted", false)
    .eq("status", "active");

  if (productsError) throw productsError;

  const productMap = new Map(
    (products ?? []).map((p: { id: string }) => [p.id, p])
  );
  const ordered = organicIds
    .map((id) => productMap.get(id))
    .filter(Boolean) as any[];

  const organic = formatProducts(ordered, blockedUserIds);

  return { sponsored, organic };
}
