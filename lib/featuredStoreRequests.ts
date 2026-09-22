import { apiRequest } from "@/lib/api";

export type FeaturedRequestStatus = "pending" | "approved" | "rejected";

export type FeaturedStoreRequest = {
  id: string;
  seller_id: string;
  message: string | null;
  status: FeaturedRequestStatus;
  created_at: string;
};

/** Latest request for the current seller. */
export async function fetchMyLatestFeaturedRequest(
  _sellerId?: string
): Promise<FeaturedStoreRequest | null> {
  const res = await apiRequest<{
    request: FeaturedStoreRequest | null;
    currentlyFeatured: boolean;
  }>("/featured/requests/latest");
  return res.request ?? null;
}

/** True if the seller currently has an active featured window. */
export async function isSellerCurrentlyFeatured(
  _sellerId?: string
): Promise<boolean> {
  const res = await apiRequest<{
    request: FeaturedStoreRequest | null;
    currentlyFeatured: boolean;
  }>("/featured/requests/latest");
  return Boolean(res.currentlyFeatured);
}

export async function submitFeaturedStoreRequest(
  _sellerId: string | undefined,
  message: string | null
): Promise<void> {
  await apiRequest("/featured/requests", {
    method: "POST",
    body: { message },
  });
}
