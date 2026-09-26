import { useUser } from "@/context/UserContext";
import { fetchFeedBatch, fetchFeedIds } from "@/lib/catalogApi";
import { BATCH_SIZE, ProductFeedItem } from "@/lib/productFeed";
import { useCallback, useEffect, useRef, useState } from "react";

type UseShuffledProductFeedOptions = {
  categoryId?: string;
  subcategoryId?: string;
  sellerId?: string;
  /** Product IDs already shown as sponsored — excluded from organic feed. */
  excludeProductIds?: string[];
  enabled?: boolean;
};

/**
 * Shuffled product feed with soft filter updates:
 * keeps the previous grid visible while a category/seller change loads.
 */
export function useShuffledProductFeed({
  categoryId,
  subcategoryId,
  sellerId,
  excludeProductIds = [],
  enabled = true,
}: UseShuffledProductFeedOptions = {}) {
  const { loading: authLoading } = useUser();

  const [shuffledIds, setShuffledIds] = useState<string[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<ProductFeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [initializing, setInitializing] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const shuffledIdsRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const isFetchingBatchRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);
  const excludeIdsKey = excludeProductIds.slice().sort().join("|");
  const excludeIdsRef = useRef<Set<string>>(new Set(excludeProductIds));

  useEffect(() => {
    excludeIdsRef.current = new Set(excludeProductIds);
  }, [excludeIdsKey, excludeProductIds]);

  const fetchNextBatch = useCallback(async () => {
    const ids = shuffledIdsRef.current;
    const startIndex = currentIndexRef.current;

    if (isFetchingBatchRef.current) return;
    if (startIndex >= ids.length) return;

    isFetchingBatchRef.current = true;
    setLoadingMore(true);

    try {
      const batchIds = ids.slice(startIndex, startIndex + BATCH_SIZE);
      if (batchIds.length === 0) return;

      const { products } = await fetchFeedBatch(batchIds);
      const formatted = (products ?? []) as ProductFeedItem[];

      const nextIndex = startIndex + BATCH_SIZE;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      setVisibleProducts((prev) => [...prev, ...formatted]);
    } catch (error) {
      if (__DEV__) {
        console.log("Error fetching product batch:", error);
      }
    } finally {
      isFetchingBatchRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  const initializeFeed = useCallback(
    async (mode: "hard" | "soft" | "refresh" = "hard") => {
      try {
        const { ids: rawIds } = await fetchFeedIds({
          categoryId,
          subcategoryId,
          sellerId,
          excludeProductIds: [...excludeIdsRef.current],
        });

        const ids = (rawIds ?? []).filter(
          (id: string) => !excludeIdsRef.current.has(id)
        );

        shuffledIdsRef.current = ids;
        currentIndexRef.current = 0;
        isFetchingBatchRef.current = false;

        setShuffledIds(ids);
        setCurrentIndex(0);

        // Soft filter: keep old cards until the first new batch arrives.
        if (mode === "hard" || mode === "refresh" || ids.length === 0) {
          setVisibleProducts([]);
        }

        if (ids.length === 0) {
          setVisibleProducts([]);
          return;
        }

        isFetchingBatchRef.current = true;
        setLoadingMore(true);
        try {
          const batchIds = ids.slice(0, BATCH_SIZE);
          const { products } = await fetchFeedBatch(batchIds);
          const formatted = (products ?? []) as ProductFeedItem[];
          currentIndexRef.current = BATCH_SIZE;
          setCurrentIndex(BATCH_SIZE);
          setVisibleProducts(formatted);
        } finally {
          isFetchingBatchRef.current = false;
          setLoadingMore(false);
        }
      } catch (error) {
        if (__DEV__) {
          console.log("Error initializing product feed:", error);
        }
        if (mode === "hard") {
          setVisibleProducts([]);
        }
      }
    },
    [categoryId, subcategoryId, sellerId, excludeIdsKey]
  );

  useEffect(() => {
    if (!enabled || authLoading) return;

    let cancelled = false;

    const boot = async () => {
      const soft = hasLoadedOnceRef.current;
      if (soft) {
        setFiltering(true);
      } else {
        setInitializing(true);
      }

      await initializeFeed(soft ? "soft" : "hard");

      if (cancelled) return;
      hasLoadedOnceRef.current = true;
      setInitializing(false);
      setFiltering(false);
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [enabled, authLoading, initializeFeed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    isFetchingBatchRef.current = false;
    await initializeFeed("refresh");
    setRefreshing(false);
  }, [initializeFeed]);

  const handleEndReached = useCallback(() => {
    if (initializing || filtering || refreshing || loadingMore) return;
    if (currentIndexRef.current >= shuffledIdsRef.current.length) return;
    fetchNextBatch();
  }, [initializing, filtering, refreshing, loadingMore, fetchNextBatch]);

  return {
    shuffledIds,
    visibleProducts,
    currentIndex,
    initializing,
    filtering,
    refreshing,
    loadingMore,
    onRefresh,
    handleEndReached,
  };
}
