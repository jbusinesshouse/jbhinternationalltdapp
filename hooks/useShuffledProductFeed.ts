import { useUser } from "@/context/UserContext";
import {
  BATCH_SIZE,
  fisherYatesShuffle,
  formatProducts,
  ProductFeedItem,
} from "@/lib/productFeed";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useRef, useState } from "react";

type UseShuffledProductFeedOptions = {
  categoryId?: string;
  subcategoryId?: string;
  /** Product IDs already shown as sponsored — excluded from organic feed. */
  excludeProductIds?: string[];
  enabled?: boolean;
};

export function useShuffledProductFeed({
  categoryId,
  subcategoryId,
  excludeProductIds = [],
  enabled = true,
}: UseShuffledProductFeedOptions = {}) {
  const { user, loading: authLoading } = useUser();

  const [shuffledIds, setShuffledIds] = useState<string[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<ProductFeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [initializing, setInitializing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const shuffledIdsRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const blockedUserIdsRef = useRef<string[]>([]);
  const isFetchingBatchRef = useRef(false);
  const excludeIdsKey = excludeProductIds.slice().sort().join("|");
  const excludeIdsRef = useRef<Set<string>>(new Set(excludeProductIds));

  useEffect(() => {
    excludeIdsRef.current = new Set(excludeProductIds);
  }, [excludeIdsKey, excludeProductIds]);

  const resolveBlockedUserIds = useCallback(async (): Promise<string[]> => {
    if (!user) return [];

    const { data: blockData, error: blockError } = await supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);

    if (blockError || !blockData) return [];
    return blockData.map((b: { blocked_id: string }) => b.blocked_id);
  }, [user]);

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

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          price,
          moq,
          seller_id,
          product_images (
            image_url,
            is_main
          )
        `
        )
        .in("id", batchIds)
        .eq("is_deleted", false)
        .eq("status", "active");

      if (error) throw error;

      const productMap = new Map(
        (data ?? []).map((product: any) => [product.id, product])
      );
      const orderedData = batchIds
        .map((id) => productMap.get(id))
        .filter(Boolean);

      const formatted = formatProducts(orderedData, blockedUserIdsRef.current);

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
      const blockedUserIds = await resolveBlockedUserIds();
      blockedUserIdsRef.current = blockedUserIds;

      let idQuery = supabase
        .from("products")
        .select("id")
        .eq("is_deleted", false)
        .eq("status", "active");

      if (categoryId) {
        idQuery = idQuery.eq("category_id", categoryId);
      }

      if (subcategoryId) {
        idQuery = idQuery.eq("subcategory_id", subcategoryId);
      }

      const { data, error } = await idQuery;

      if (error) throw error;

      const ids = fisherYatesShuffle(
        (data ?? [])
          .map((row: { id: string }) => row.id)
          .filter((id: string) => !excludeIdsRef.current.has(id))
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
  }, [categoryId, subcategoryId, excludeIdsKey, resolveBlockedUserIds, fetchNextBatch]);

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
