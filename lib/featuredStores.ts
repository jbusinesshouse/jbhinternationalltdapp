import { apiRequest } from "@/lib/api";

export const FEATURED_STORES_LIMIT = 16;
/** Max stores per row in the Home carousel (2 rows × 8 = 16). */
export const FEATURED_STORES_PER_ROW = 8;

export type FeaturedStore = {
  id: string;
  store_name: string | null;
  avatar_url: string | null;
};

/**
 * Active featured stores via Express `/feed/featured-stores`.
 */
export async function fetchActiveFeaturedStores(): Promise<FeaturedStore[]> {
  const res = await apiRequest<{ stores: FeaturedStore[] }>(
    "/feed/featured-stores",
    { auth: false }
  );
  return (res.stores ?? []).slice(0, FEATURED_STORES_LIMIT);
}
