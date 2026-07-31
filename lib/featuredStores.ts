import { fisherYatesShuffle } from "@/lib/productFeed";
import { supabase } from "@/lib/supabase";

export const FEATURED_STORES_LIMIT = 16;
/** Max stores per row in the Home carousel (2 rows × 8 = 16). */
export const FEATURED_STORES_PER_ROW = 8;

export type FeaturedStore = {
  id: string;
  store_name: string | null;
  avatar_url: string | null;
};

/**
 * Active featured stores within the current time window,
 * with seller profile fields needed for the carousel.
 *
 * Randomly selects up to FEATURED_STORES_LIMIT sellers each call
 * so refresh/reload can show a different batch.
 */
export async function fetchActiveFeaturedStores(): Promise<FeaturedStore[]> {
  const now = new Date().toISOString();

  const { data: featuredRows, error: featuredError } = await supabase
    .from("featured_stores")
    .select("seller_id")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now);

  if (featuredError) throw featuredError;
  if (!featuredRows?.length) return [];

  const sellerIds = [
    ...new Set(
      featuredRows
        .map((row) => row.seller_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];

  if (sellerIds.length === 0) return [];

  // Randomize active seller IDs, then only load profiles for this batch
  const selectedIds = fisherYatesShuffle(sellerIds).slice(
    0,
    FEATURED_STORES_LIMIT
  );

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, store_name, avatar_url")
    .in("id", selectedIds);

  if (profilesError) throw profilesError;

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      {
        id: profile.id,
        store_name: profile.store_name ?? null,
        avatar_url: profile.avatar_url ?? null,
      } satisfies FeaturedStore,
    ])
  );

  // Preserve shuffled order; drop IDs with missing profiles
  return selectedIds
    .map((id) => profileMap.get(id))
    .filter((store): store is FeaturedStore => store != null);
}
