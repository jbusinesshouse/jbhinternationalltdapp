import { supabase } from "@/lib/supabase";

export type FeaturedRequestStatus = "pending" | "approved" | "rejected";

export type FeaturedStoreRequest = {
  id: string;
  seller_id: string;
  message: string | null;
  status: FeaturedRequestStatus;
  created_at: string;
};

/** Latest request for the current seller (any status). */
export async function fetchMyLatestFeaturedRequest(
  sellerId: string
): Promise<FeaturedStoreRequest | null> {
  const { data, error } = await supabase
    .from("featured_store_requests")
    .select("id, seller_id, message, status, created_at")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as FeaturedStoreRequest | null) ?? null;
}

/** True if the seller currently has an active featured window. */
export async function isSellerCurrentlyFeatured(
  sellerId: string
): Promise<boolean> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("featured_stores")
    .select("seller_id")
    .eq("seller_id", sellerId)
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function submitFeaturedStoreRequest(
  sellerId: string,
  message: string | null
): Promise<void> {
  const { error } = await supabase.from("featured_store_requests").insert({
    seller_id: sellerId,
    message,
    status: "pending",
  });

  if (error) throw error;
}
