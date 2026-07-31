import SingleProduct from "@/components/SingleProduct";
import { useUser } from "@/context/UserContext";
import { ProductFeedItem } from "@/lib/productFeed";
import { AdvertisedProduct } from "@/lib/productAds";
import { fetchRelatedProducts } from "@/lib/relatedProducts";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

type RelatedProductsSectionProps = {
  productId: string;
  categoryId: string | null | undefined;
  /** Bump to reload (e.g. pull-to-refresh). */
  refreshKey?: number;
};

type FeedRow = (ProductFeedItem | AdvertisedProduct) & {
  isSponsored?: boolean;
};

function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

/**
 * Related products below product detail:
 * sponsored (same category) first, then randomized organic.
 * Rendered as static rows (safe inside parent ScrollView).
 */
export default function RelatedProductsSection({
  productId,
  categoryId,
  refreshKey = 0,
}: RelatedProductsSectionProps) {
  const { user } = useUser();
  const [sponsored, setSponsored] = useState<AdvertisedProduct[]>([]);
  const [organic, setOrganic] = useState<ProductFeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!productId || !categoryId) {
      setSponsored([]);
      setOrganic([]);
      return;
    }

    setLoading(true);
    try {
      let blockedUserIds: string[] = [];
      if (user?.id) {
        const { data } = await supabase
          .from("blocks")
          .select("blocked_id")
          .eq("blocker_id", user.id);
        blockedUserIds = (data ?? []).map(
          (row: { blocked_id: string }) => row.blocked_id
        );
      }

      const result = await fetchRelatedProducts({
        productId: String(productId),
        categoryId,
        blockedUserIds,
      });

      setSponsored(result.sponsored);
      setOrganic(result.organic);
    } catch (error) {
      if (__DEV__) {
        console.warn("[RelatedProducts] load failed:", error);
      }
      setSponsored([]);
      setOrganic([]);
    } finally {
      setLoading(false);
    }
  }, [productId, categoryId, user?.id, refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  const list = useMemo<FeedRow[]>(
    () => [...sponsored, ...organic],
    [sponsored, organic]
  );

  const rows = useMemo(() => chunkPairs(list), [list]);

  if (!categoryId) return null;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Related products</Text>
        <ActivityIndicator color="#f5832b" style={{ marginVertical: 16 }} />
      </View>
    );
  }

  if (list.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.bar} />
        <Text style={styles.heading}>Related products</Text>
      </View>
      {sponsored.length > 0 ? (
        <Text style={styles.hint}>Promoted products from this category</Text>
      ) : (
        <View style={{ height: 8 }} />
      )}

      {rows.map((row, rowIndex) => (
        <View key={`related-row-${rowIndex}`} style={styles.row}>
          {row.map((item) => (
            <SingleProduct
              key={item.id}
              productId={item.id}
              title={item.name}
              price={item.price}
              moq={item.moq}
              sponsored={!!item.isSponsored}
              productImg={
                item.productImg
                  ? { uri: item.productImg }
                  : require("@/assets/images/product1.png")
              }
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 24,
    backgroundColor: "#F3F4F6",
    paddingTop: 16,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#f5832b",
    marginRight: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  hint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 12,
    marginLeft: 11,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
});
