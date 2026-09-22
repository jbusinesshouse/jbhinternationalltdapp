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
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const shuffledIdsRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const isFetchingBatchRef = useRef(false);
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

  const initializeFeed = useCallback(async () => {
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

      setShuffledIds(ids);
      setVisibleProducts([]);
      setCurrentIndex(0);

      if (ids.length > 0) {
        isFetchingBatchRef.current = false;
        await fetchNextBatch();
      }
    } catch (error) {
      if (__DEV__) {
        console.log("Error initializing product feed:", error);
      }
    }
  }, [categoryId, subcategoryId, sellerId, excludeIdsKey, fetchNextBatch]);

  useEffect(() => {
    if (!enabled || authLoading) return;

    const boot = async () => {
      setInitializing(true);
      await initializeFeed();
      setInitializing(false);
    };

    boot();
  }, [enabled, authLoading, initializeFeed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    isFetchingBatchRef.current = false;
    await initializeFeed();
    setRefreshing(false);
  }, [initializeFeed]);

  const handleEndReached = useCallback(() => {
    if (initializing || refreshing || loadingMore) return;
    if (currentIndexRef.current >= shuffledIdsRef.current.length) return;
    fetchNextBatch();
  }, [initializing, refreshing, loadingMore, fetchNextBatch]);

  return {
    shuffledIds,
    visibleProducts,
    currentIndex,
    initializing,
    refreshing,
    loadingMore,
    onRefresh,
    handleEndReached,
  };
}
