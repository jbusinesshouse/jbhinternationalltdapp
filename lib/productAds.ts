import { apiRequest } from "@/lib/api";
import { ProductFeedItem } from "@/lib/productFeed";

export const AD_FEED_ALL_MAX = 30;
export const AD_FEED_ALL_MIN = 20;
export const AD_FEED_CATEGORY_MAX = 20;

export type AdvertisedProduct = ProductFeedItem & {
  isSponsored: true;
};

type FetchActiveAdvertisedProductsOptions = {
  categoryId?: string;
  subcategoryId?: string;
  blockedUserIds?: string[];
  limit?: number;
};

export async function fetchActiveAdvertisedProducts(
  options: FetchActiveAdvertisedProductsOptions = {}
): Promise<AdvertisedProduct[]> {
  const { categoryId, subcategoryId, limit: explicitLimit } = options;

  const params = new URLSearchParams();
  if (categoryId) params.set("categoryId", categoryId);
  if (subcategoryId) params.set("subcategoryId", subcategoryId);
  const qs = params.toString();

  const res = await apiRequest<{ products: AdvertisedProduct[] }>(
    `/feed/ads${qs ? `?${qs}` : ""}`,
    { auth: "optional" }
  );
  const products = (res.products ?? []).map((p) => ({
    ...p,
    isSponsored: true as const,
  }));

  if (typeof explicitLimit === "number" && explicitLimit > 0) {
    return products.slice(0, explicitLimit);
  }
  return products;
}
