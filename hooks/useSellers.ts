import { fetchSellers, type SellerListItem } from "@/lib/catalogApi";
import { useCallback, useEffect, useRef, useState } from "react";

type UseSellersOptions = {
  q?: string;
  storeType?: "wholesale" | "retail" | "all";
  limit?: number;
  enabled?: boolean;
};

type UseSellersResult = {
  sellers: SellerListItem[];
  total: number;
  loading: boolean;
  refetch: () => Promise<void>;
};

/**
 * Loads the public seller directory for Manufacturers browsing.
 */
export function useSellers({
  q,
  storeType = "wholesale",
  limit = 80,
  enabled = true,
}: UseSellersOptions = {}): UseSellersResult {
  const [sellers, setSellers] = useState<SellerListItem[]>([]);
  const [total, setTotal] = useState(0);
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
      if (!enabled) {
        if (isMountedRef.current) {
          setSellers([]);
          setTotal(0);
          setLoading(false);
        }
        return;
      }
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isInitial && isMountedRef.current) {
        setLoading(true);
      }

      try {
        const res = await fetchSellers({ q, storeType, limit, offset: 0 });
        if (isMountedRef.current) {
          setSellers(res.sellers ?? []);
          setTotal(res.total ?? 0);
        }
      } catch (error) {
        console.warn("[useSellers] fetch failed:", error);
        if (isMountedRef.current) {
          setSellers([]);
          setTotal(0);
        }
      } finally {
        isFetchingRef.current = false;
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [enabled, q, storeType, limit]
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const refetch = useCallback(async () => {
    await load(false);
  }, [load]);

  return { sellers, total, loading, refetch };
}
