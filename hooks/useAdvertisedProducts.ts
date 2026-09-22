import { useUser } from "@/context/UserContext";
import {
  AdvertisedProduct,
  fetchActiveAdvertisedProducts,
} from "@/lib/productAds";
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
 * Block filtering is applied on the server when authenticated.
 */
export function useAdvertisedProducts({
  categoryId,
  subcategoryId,
  enabled = true,
}: UseAdvertisedProductsOptions = {}): UseAdvertisedProductsResult {
  const { loading: authLoading } = useUser();
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
        const next = await fetchActiveAdvertisedProducts({
          categoryId,
          subcategoryId,
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
    [enabled, authLoading, categoryId, subcategoryId]
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
