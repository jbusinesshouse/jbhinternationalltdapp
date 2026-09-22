import { apiRequest } from "@/lib/api";

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

/** Active products the seller can advertise. */
export async function fetchSellerProductsForAds(
  _sellerId?: string
): Promise<SellerProductForAd[]> {
  const res = await apiRequest<{ products: SellerProductForAd[] }>(
    "/ads/my-products"
  );
  return res.products ?? [];
}

/** Latest request for the current seller. */
export async function fetchMyLatestProductAdRequest(
  _sellerId?: string
): Promise<ProductAdRequest | null> {
  const res = await apiRequest<{ request: ProductAdRequest | null }>(
    "/ads/requests/latest"
  );
  return res.request ?? null;
}

export async function submitProductAdRequest(params: {
  sellerId?: string;
  productIds: string[];
  sellTargetBdt: number;
  budgetBdt: number;
}): Promise<void> {
  const { productIds, sellTargetBdt, budgetBdt } = params;

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

  await apiRequest("/ads/requests", {
    method: "POST",
    body: {
      productIds,
      sellTargetBdt,
      budgetBdt,
    },
  });
}
