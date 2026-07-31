import FeaturedStores from "@/components/home/FeaturedStores";
import HomeCategories from "@/components/home/HomeCategories";
import TopBar from "@/components/home/TopBar";
import SingleProduct from "@/components/SingleProduct";
import WholesalePromoBanner from "@/components/WholesalePromoBanner";
import { useAdvertisedProducts } from "@/hooks/useAdvertisedProducts";
import { useFeaturedStores } from "@/hooks/useFeaturedStores";
import { useProfile } from "@/hooks/useProfile";
import { useShuffledProductFeed } from "@/hooks/useShuffledProductFeed";
import { AdvertisedProduct } from "@/lib/productAds";
import { ProductFeedItem } from "@/lib/productFeed";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

type FeedRow = (ProductFeedItem | AdvertisedProduct) & {
  isSponsored?: boolean;
};

type RenderProps = {
  item: FeedRow;
};

export default function Index() {
  const { profile } = useProfile();
  const isWholesale = profile?.store_type === "wholesale";

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    string | null
  >(null);

  const categoryId = selectedCategoryId ?? undefined;
  const subcategoryId = selectedSubcategoryId ?? undefined;

  const {
    products: advertisedProducts,
    productIds: advertisedIds,
    loading: adsLoading,
    refetch: refetchAds,
  } = useAdvertisedProducts({
    categoryId,
    subcategoryId,
  });

  const {
    visibleProducts,
    initializing,
    refreshing,
    loadingMore,
    onRefresh,
    handleEndReached,
  } = useShuffledProductFeed({
    categoryId,
    subcategoryId,
    excludeProductIds: advertisedIds,
    // Wait until ads settle so exclude set is stable on first paint
    enabled: !adsLoading,
  });

  const {
    stores: featuredStores,
    loading: featuredLoading,
    refetch: refetchFeaturedStores,
  } = useFeaturedStores();

  const listData = useMemo<FeedRow[]>(() => {
    if (adsLoading) return [];
    const adIdSet = new Set(advertisedIds);
    const organic = visibleProducts.filter((p) => !adIdSet.has(p.id));
    return [...advertisedProducts, ...organic];
  }, [adsLoading, advertisedProducts, advertisedIds, visibleProducts]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchAds(),
      onRefresh(),
      refetchFeaturedStores(),
    ]);
  }, [refetchAds, onRefresh, refetchFeaturedStores]);

  const feedTitle = useMemo(() => {
    if (!selectedCategoryId) return "All Products";
    return selectedSubcategoryId ? "Products" : "Category Products";
  }, [selectedCategoryId, selectedSubcategoryId]);

  const renderItem = ({ item }: RenderProps) => (
    <SingleProduct
      productImg={
        item.productImg
          ? { uri: item.productImg }
          : require("@/assets/images/product1.png")
      }
      title={item.name}
      price={item.price}
      moq={item.moq}
      productId={item.id}
      sponsored={!!item.isSponsored}
    />
  );

  const flatHeaderSection = useMemo(
    () => (
      <View>
        {isWholesale ? <WholesalePromoBanner href="/advertiseProduct" /> : null}

        <HomeCategories
          selectedCategoryId={selectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId}
          onSelectCategory={setSelectedCategoryId}
          onSelectSubcategory={setSelectedSubcategoryId}
        />

        {!selectedCategoryId ? (
          <FeaturedStores
            stores={featuredStores}
            loading={featuredLoading}
          />
        ) : null}

        <View style={styles.sectionHead}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionBar} />
            <Text style={styles.recommendedHeading}>{feedTitle}</Text>
          </View>
          {advertisedProducts.length > 0 ? (
            <Text style={styles.sectionHint}>
              Promoted products shown first · refreshed randomly
            </Text>
          ) : null}
        </View>
      </View>
    ),
    [
      selectedCategoryId,
      selectedSubcategoryId,
      featuredStores,
      featuredLoading,
      feedTitle,
      advertisedProducts.length,
      isWholesale,
    ]
  );

  const listFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#f5832b" />
      </View>
    );
  };

  const showInitialLoader =
    (adsLoading || initializing) && listData.length === 0;

  if (showInitialLoader) {
    return (
      <View style={styles.screen}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f5832b" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TopBar />
      <View style={styles.mainContainer}>
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item.isSponsored ? `ad-${item.id}` : item.id.toString()
          }
          ListHeaderComponent={flatHeaderSection}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyBody}>
                Try another category or pull to refresh.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.productWrap}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#f5832b"
              colors={["#f5832b"]}
            />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  sectionHead: {
    marginBottom: 12,
    marginTop: 2,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#f5832b",
    marginRight: 8,
  },
  recommendedHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  sectionHint: {
    marginTop: 4,
    marginLeft: 11,
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  productWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  listContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyWrap: {
    paddingTop: 48,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 19,
  },
});
