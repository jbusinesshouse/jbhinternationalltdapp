import { supabase } from "@/lib/supabase";

export type ProductAdRequestStatus = "pending" | "approved" | "rejected";

export type AdPackage = {
  sellTargetBdt: 20000 | 50000 | 100000;
  budgetBdt: 2000 | 4000 | 8000;
  label: string;
};

export const AD_PACKAGES: AdPackage[] = [
  {
    sellTargetBdt: 20000,
    budgetBdt: 2000,
    label: "সেল টার্গেট ৳২০,০০০ · বাজেট ৳২,০০০",
  },
  {
    sellTargetBdt: 50000,
    budgetBdt: 4000,
    label: "সেল টার্গেট ৳৫০,০০০ · বাজেট ৳৪,০০০",
  },
  {
    sellTargetBdt: 100000,
    budgetBdt: 8000,
    label: "সেল টার্গেট ৳১০০,০০০ · বাজেট ৳৮,০০০",
  },
];

export const AD_DURATION_DAYS = 10;

export type SellerProductForAd = {
  id: string;
  name: string;
  price: number | string;
  status: string | null;
  product_images?: {
    image_url: string;
    is_main: boolean;
  }[];
};

export type ProductAdRequestItem = {
  product_id: string;
  products: {
    id: string;
    name: string | null;
    product_images?: {
      image_url: string;
      is_main: boolean;
    }[];
  } | null;
};

export type ProductAdRequest = {
  id: string;
  seller_id: string;
  sell_target_bdt: number;
  budget_bdt: number;
  duration_days: number;
  status: ProductAdRequestStatus;
  created_at: string;
  product_ad_request_items?: ProductAdRequestItem[];
};

/** Active (non-deleted) products the seller can advertise. */
export async function fetchSellerProductsForAds(
  sellerId: string
): Promise<SellerProductForAd[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      status,
      product_images (
        image_url,
        is_main
      )
    `
    )
    .eq("seller_id", sellerId)
    .eq("is_deleted", false)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as SellerProductForAd[]) ?? [];
}

/** Latest request for the current seller (any status), with items + product info. */
export async function fetchMyLatestProductAdRequest(
  sellerId: string
): Promise<ProductAdRequest | null> {
  const { data, error } = await supabase
    .from("product_ad_requests")
    .select(
      `
      id,
      seller_id,
      sell_target_bdt,
      budget_bdt,
      duration_days,
      status,
      created_at,
      product_ad_request_items (
        product_id,
        products (
          id,
          name,
          product_images (
            image_url,
            is_main
          )
        )
      )
    `
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as ProductAdRequest | null) ?? null;
}

export async function submitProductAdRequest(params: {
  sellerId: string;
  productIds: string[];
  sellTargetBdt: number;
  budgetBdt: number;
}): Promise<void> {
  const { sellerId, productIds, sellTargetBdt, budgetBdt } = params;

  if (!productIds.length) {
    throw new Error("Select at least one product");
  }

  const packageOk = AD_PACKAGES.some(
    (pkg) =>
      pkg.sellTargetBdt === sellTargetBdt && pkg.budgetBdt === budgetBdt
  );
  if (!packageOk) {
    throw new Error("Invalid advertising package");
  }

  const { data: request, error: requestError } = await supabase
    .from("product_ad_requests")
    .insert({
      seller_id: sellerId,
      sell_target_bdt: sellTargetBdt,
      budget_bdt: budgetBdt,
      duration_days: AD_DURATION_DAYS,
      status: "pending",
    })
    .select("id")
    .single();

  if (requestError) throw requestError;
  if (!request?.id) throw new Error("Failed to create advertising request");

  const items = productIds.map((productId) => ({
    request_id: request.id,
    product_id: productId,
  }));

  const { error: itemsError } = await supabase
    .from("product_ad_request_items")
    .insert(items);

  if (itemsError) throw itemsError;
}
