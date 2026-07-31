import { useUser } from "@/context/UserContext";
import {
  AdvertisedProduct,
  fetchActiveAdvertisedProducts,
} from "@/lib/productAds";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useRef, useState } from "react";

type UseAdvertisedProductsOptions = {
  categoryId?: string;
  subcategoryId?: string;
  enabled?: boolean;
};

type UseAdvertisedProductsResult = {
  products: AdvertisedProduct[];
  productIds: string[];
  loading: boolean;
  refetch: () => Promise<void>;
};

/**
 * Loads a shuffled slice of active sponsored products for home / category feeds.
 * Failures are swallowed so the screen can omit the sponsored block.
 */
export function useAdvertisedProducts({
  categoryId,
  subcategoryId,
  enabled = true,
}: UseAdvertisedProductsOptions = {}): UseAdvertisedProductsResult {
  const { user, loading: authLoading } = useUser();
  const [products, setProducts] = useState<AdvertisedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resolveBlockedUserIds = useCallback(async (): Promise<string[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);

    if (error || !data) return [];
    return data.map((row: { blocked_id: string }) => row.blocked_id);
  }, [user]);

  const load = useCallback(
    async (isInitial: boolean) => {
      if (!enabled || authLoading) return;
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isInitial && isMountedRef.current) {
        setLoading(true);
        setProducts([]);
      }

      try {
        const blockedUserIds = await resolveBlockedUserIds();
        const next = await fetchActiveAdvertisedProducts({
          categoryId,
          subcategoryId,
          blockedUserIds,
        });

        if (isMountedRef.current) {
          setProducts(next);
        }
      } catch (error) {
        console.warn("[AdvertisedProducts] fetch failed:", error);
        if (isMountedRef.current) {
          setProducts([]);
        }
      } finally {
        isFetchingRef.current = false;
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [
      enabled,
      authLoading,
      categoryId,
      subcategoryId,
      resolveBlockedUserIds,
    ]
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const refetch = useCallback(async () => {
    await load(false);
  }, [load]);

  return {
    products,
    productIds: products.map((p) => p.id),
    loading,
    refetch,
  };
}
