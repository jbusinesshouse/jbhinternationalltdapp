import {
  FEATURED_STORES_PER_ROW,
  FeaturedStore,
} from "@/lib/featuredStores";
import { useRouter } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type FeaturedStoresProps = {
  stores: FeaturedStore[];
  loading: boolean;
};

const SKELETON_PER_ROW = 6;

function StoreRow({ stores }: { stores: FeaturedStore[] }) {
  if (stores.length === 0) return null;

  return (
    <View style={styles.row}>
      {stores.map((store) => (
        <MemoFeaturedStoreItem key={store.id} store={store} />
      ))}
    </View>
  );
}

function FeaturedStoresSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.headingPlaceholder} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.rows}>
          <View style={styles.row}>
            {Array.from({ length: SKELETON_PER_ROW }, (_, index) => (
              <View key={`sk-a-${index}`} style={styles.item}>
                <View style={styles.logoSkeleton} />
                <View style={styles.nameSkeleton} />
              </View>
            ))}
          </View>
          <View style={styles.row}>
            {Array.from({ length: SKELETON_PER_ROW }, (_, index) => (
              <View key={`sk-b-${index}`} style={styles.item}>
                <View style={styles.logoSkeleton} />
                <View style={styles.nameSkeleton} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FeaturedStoreItem({ store }: { store: FeaturedStore }) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/publicProfile/[id]",
      params: { id: store.id },
    });
  }, [router, store.id]);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.item}
      accessibilityRole="button"
      accessibilityLabel={store.store_name ?? "Store"}
    >
      <Image
        source={
          store.avatar_url
            ? { uri: store.avatar_url }
            : require("@/assets/images/store1.jpg")
        }
        style={styles.logo}
      />
      <Text numberOfLines={2} style={styles.storeName}>
        {store.store_name?.trim() || "Store"}
      </Text>
    </Pressable>
  );
}

const MemoFeaturedStoreItem = memo(FeaturedStoreItem);

function FeaturedStores({ stores, loading }: FeaturedStoresProps) {
  const { topRow, bottomRow } = useMemo(() => {
    return {
      topRow: stores.slice(0, FEATURED_STORES_PER_ROW),
      bottomRow: stores.slice(
        FEATURED_STORES_PER_ROW,
        FEATURED_STORES_PER_ROW * 2
      ),
    };
  }, [stores]);

  if (loading) {
    return <FeaturedStoresSkeleton />;
  }

  if (stores.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Featured Stores</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/*
          Two stacked rows share one horizontal scroll.
          First 8 stores → top row; next 8 → bottom row.
          Fewer than 8 → only top row. 9–15 → top full + short bottom.
        */}
        <View style={styles.rows}>
          <StoreRow stores={topRow} />
          <StoreRow stores={bottomRow} />
        </View>
      </ScrollView>
    </View>
  );
}

export default memo(FeaturedStores);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 15,
    marginTop: 10,
  },
  heading: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  headingPlaceholder: {
    width: 140,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
    marginHorizontal: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  item: {
    width: 76,
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
  },
  logoSkeleton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },
  storeName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
    lineHeight: 16,
  },
  nameSkeleton: {
    marginTop: 8,
    width: 56,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});
