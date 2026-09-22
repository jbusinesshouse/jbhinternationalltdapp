import { apiRequest } from "@/lib/api";
import { ProductFeedItem } from "@/lib/productFeed";
import { AdvertisedProduct } from "@/lib/productAds";

export const RELATED_AD_LIMIT = 12;
export const RELATED_ORGANIC_LIMIT = 12;

export type RelatedProductsResult = {
  sponsored: AdvertisedProduct[];
  organic: ProductFeedItem[];
};

export async function fetchRelatedProducts(options: {
  productId: string;
  categoryId?: string;
  blockedUserIds?: string[];
}): Promise<RelatedProductsResult> {
  const { productId } = options;
  if (!productId) {
    return { sponsored: [], organic: [] };
  }

  const res = await apiRequest<{
    sponsored: AdvertisedProduct[];
    organic: ProductFeedItem[];
  }>(`/products/${productId}/related`, { auth: "optional" });

  return {
    sponsored: (res.sponsored ?? []).map((p) => ({
      ...p,
      isSponsored: true as const,
    })),
    organic: res.organic ?? [],
  };
}
