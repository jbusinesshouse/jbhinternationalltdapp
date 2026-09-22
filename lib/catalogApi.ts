import { apiRequest, apiUpload, filePartFromUri, newIdempotencyKey } from "@/lib/api";

export type Category = { id: string; name: string };
export type Subcategory = { id: string; name: string; category_id?: string };
export type SizeRow = { id: string; label: string; category?: string | null };

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiRequest<{ categories: Category[] }>("/categories", {
    auth: false,
  });
  return res.categories ?? [];
}

export async function fetchSubcategories(
  categoryId: string
): Promise<Subcategory[]> {
  const res = await apiRequest<{ subcategories: Subcategory[] }>(
    `/categories/${categoryId}/subcategories`,
    { auth: false }
  );
  return res.subcategories ?? [];
}

export async function fetchSizes(category?: string): Promise<SizeRow[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await apiRequest<{ sizes: SizeRow[] }>(`/sizes${qs}`, {
    auth: false,
  });
  return res.sizes ?? [];
}

export async function fetchFeedIds(options: {
  categoryId?: string;
  subcategoryId?: string;
  sellerId?: string;
  excludeProductIds?: string[];
}) {
  const params = new URLSearchParams();
  if (options.categoryId) params.set("categoryId", options.categoryId);
  if (options.subcategoryId) params.set("subcategoryId", options.subcategoryId);
  if (options.sellerId) params.set("sellerId", options.sellerId);
  if (options.excludeProductIds?.length) {
    params.set("exclude", options.excludeProductIds.join(","));
  }
  const qs = params.toString();
  return apiRequest<{ ids: string[]; batchSize: number }>(
    `/feed/ids${qs ? `?${qs}` : ""}`,
    { auth: "optional" }
  );
}

export async function fetchFeedBatch(ids: string[]) {
  return apiRequest<{ products: any[] }>("/feed/batch", {
    method: "POST",
    body: { ids },
    auth: "optional",
  });
}

export async function fetchProductDetail(productId: string) {
  return apiRequest<{
    product: any;
    rating: { average: number; count: number };
    reviews: any[];
  }>(`/products/${productId}`, { auth: "optional" });
}

export async function searchProducts(q: string) {
  const res = await apiRequest<{ products: any[] }>(
    `/products/search?q=${encodeURIComponent(q.trim())}`,
    { auth: "optional" }
  );
  return res.products ?? [];
}

export async function fetchPublicProfile(profileId: string) {
  const res = await apiRequest<{ profile: any }>(`/profiles/${profileId}`, {
    auth: false,
  });
  return res.profile;
}

export async function fetchPublicProfileProducts(profileId: string) {
  const res = await apiRequest<{ products: any[] }>(
    `/profiles/${profileId}/products`,
    { auth: false }
  );
  return res.products ?? [];
}

export type SellerListItem = {
  id: string;
  store_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  district: string | null;
  store_type: string | null;
  product_count: number;
};

/** Active wholesale sellers that have at least one listed product. */
export async function fetchSellers(options: {
  q?: string;
  limit?: number;
  offset?: number;
  storeType?: "wholesale" | "retail" | "all";
} = {}) {
  const params = new URLSearchParams();
  if (options.q?.trim()) params.set("q", options.q.trim());
  if (typeof options.limit === "number") params.set("limit", String(options.limit));
  if (typeof options.offset === "number")
    params.set("offset", String(options.offset));
  if (options.storeType) params.set("storeType", options.storeType);
  const qs = params.toString();
  return apiRequest<{ sellers: SellerListItem[]; total: number }>(
    `/feed/sellers${qs ? `?${qs}` : ""}`,
    { auth: false }
  );
}

export async function fetchMyProfile() {
  return apiRequest<{ profile: any; authUser: { id: string; email?: string } }>(
    "/profiles/me"
  );
}

export async function upsertMyProfile(body: Record<string, unknown>) {
  return apiRequest<{ profile: any }>("/profiles/me", {
    method: "PUT",
    body,
  });
}

export async function patchMyProfile(body: Record<string, unknown>) {
  return apiRequest<{ profile: any }>("/profiles/me", {
    method: "PATCH",
    body,
  });
}

export async function uploadAvatar(uri: string) {
  const form = new FormData();
  form.append("file", filePartFromUri(uri, "avatar.jpg") as any);
  return apiUpload<{ path: string; publicUrl: string }>("/uploads/avatar", form);
}

export async function createProduct(body: Record<string, unknown>) {
  return apiRequest<{ id: string }>("/products", {
    method: "POST",
    body,
  });
}

export async function updateProduct(
  productId: string,
  body: Record<string, unknown>
) {
  return apiRequest<{ ok: boolean; id: string }>(`/products/${productId}`, {
    method: "PATCH",
    body,
  });
}

export async function deleteProduct(productId: string) {
  return apiRequest<{ ok: boolean }>(`/products/${productId}`, {
    method: "DELETE",
  });
}

export async function fetchAccountProducts() {
  const res = await apiRequest<{ products: any[] }>("/account/products");
  return res.products ?? [];
}

export async function placeOrder(body: Record<string, unknown>) {
  return apiRequest<{ orderId: string }>("/orders", {
    method: "POST",
    body,
    idempotencyKey: newIdempotencyKey(),
  });
}

export async function fetchMyOrders() {
  const res = await apiRequest<{ orders: any[] }>("/orders");
  return res.orders ?? [];
}

export async function fetchOrderDetail(orderId: string) {
  return apiRequest<{ order: any; seller: any; review: any }>(
    `/orders/${orderId}`
  );
}

export async function respondToCancelRequest(
  orderId: string,
  accept: boolean,
  notificationId?: string
) {
  return apiRequest<{ ok: boolean; status: string }>(
    `/orders/${orderId}/cancel-response`,
    {
      method: "POST",
      body: { accept, notificationId },
    }
  );
}

export async function fetchSalesOrders() {
  const res = await apiRequest<{ orders: any[] }>("/sales");
  return res.orders ?? [];
}

export async function fetchSaleDetail(orderId: string) {
  return apiRequest<{ order: any }>(`/sales/${orderId}`);
}

export async function updateSaleStatus(
  orderId: string,
  status: string
) {
  return apiRequest<{ ok: boolean; status?: string; cancelRequestSent?: boolean }>(
    `/sales/${orderId}/status`,
    {
      method: "PATCH",
      body: { status },
    }
  );
}

export async function fetchNotifications() {
  const res = await apiRequest<{ notifications: any[] }>("/notifications");
  return res.notifications ?? [];
}

export async function fetchUnreadNotificationCount() {
  const res = await apiRequest<{ count: number }>(
    "/notifications/unread-count"
  );
  return res.count ?? 0;
}

export async function markNotificationRead(id: string) {
  return apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function patchNotification(
  id: string,
  body: { is_read?: boolean; action_completed?: boolean }
) {
  return apiRequest(`/notifications/${id}`, {
    method: "PATCH",
    body,
  });
}

export async function submitSupport(body: {
  subject: string;
  message: string;
  category?: string;
}) {
  return apiRequest("/support", { method: "POST", body });
}

export async function submitReport(body: {
  targetType: "product" | "user";
  productId?: string | null;
  profileId?: string | null;
  reason: "spam" | "scam" | "inappropriate" | "other";
  details?: string | null;
}) {
  return apiRequest("/reports", { method: "POST", body });
}

export async function blockUser(blockedId: string) {
  return apiRequest("/blocks", {
    method: "POST",
    body: { blockedId },
  });
}
