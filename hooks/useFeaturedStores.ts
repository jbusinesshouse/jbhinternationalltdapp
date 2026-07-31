import {
  FeaturedStore,
  fetchActiveFeaturedStores,
} from "@/lib/featuredStores";
import { useCallback, useEffect, useRef, useState } from "react";

type UseFeaturedStoresResult = {
  stores: FeaturedStore[];
  loading: boolean;
  refetch: () => Promise<void>;
};

/**
 * Loads active featured stores for the Home carousel.
 * Failures are swallowed so the Home screen can simply omit the section.
 */
export function useFeaturedStores(): UseFeaturedStoresResult {
  const [stores, setStores] = useState<FeaturedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async (isInitial: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isInitial && isMountedRef.current) {
      setLoading(true);
    }

    try {
      const nextStores = await fetchActiveFeaturedStores();
      if (__DEV__) {
        console.log(
          `[FeaturedStores] loaded ${nextStores.length} store(s)`
        );
      }
      if (isMountedRef.current) {
        setStores(nextStores);
      }
    } catch (error) {
      // Surface in Metro so silent failures are diagnosable during setup
      console.warn("[FeaturedStores] fetch failed:", error);
      // Fail silently in UI — omit the section
      if (isMountedRef.current) {
        setStores([]);
      }
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  const refetch = useCallback(async () => {
    await load(false);
  }, [load]);

  return { stores, loading, refetch };
}
