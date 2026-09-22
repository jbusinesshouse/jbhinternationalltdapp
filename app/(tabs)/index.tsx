import FeaturedStores from "@/components/home/FeaturedStores";
import GridColumnSwitcher from "@/components/home/GridColumnSwitcher";
import HomeCategories from "@/components/home/HomeCategories";
import QuickActionsRow from "@/components/home/QuickActionsRow";
import SellerFilterBar from "@/components/home/SellerFilterBar";
import TopBar from "@/components/home/TopBar";
import SingleProduct from "@/components/SingleProduct";
import WholesalePromoBanner from "@/components/WholesalePromoBanner";
import { useAdvertisedProducts } from "@/hooks/useAdvertisedProducts";
import {
  useCatalogPrefs,
  type GridColumns,
} from "@/hooks/useCatalogPrefs";
import { useFeaturedStores } from "@/hooks/useFeaturedStores";
import { useProfile } from "@/hooks/useProfile";
import { useSellers } from "@/hooks/useSellers";
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

const LIST_INSET = 24;

function gapFor(columns: GridColumns) {
  if (columns === 4) return 6;
  if (columns === 3) return 8;
  return 12;
}

export default function Index() {
  const { profile } = useProfile();
  const isWholesale = profile?.store_type === "wholesale";

  const {
    gridColumns,
    setGridColumns,
    categoriesExpanded,
    toggleCategoriesExpanded,
    homeMode,
    setHomeMode,
  } = useCatalogPrefs();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    string | null
  >(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  const categoryId = selectedCategoryId ?? undefined;
  const subcategoryId = selectedSubcategoryId ?? undefined;
  const columnGap = gapFor(gridColumns);
  const isManufacturers = homeMode === "manufacturers";

  const {
    products: advertisedProducts,
    productIds: advertisedIds,
    loading: adsLoading,
    refetch: refetchAds,
  } = useAdvertisedProducts({
    categoryId: isManufacturers ? undefined : categoryId,
    subcategoryId: isManufacturers ? undefined : subcategoryId,
  });

  const {
    visibleProducts,
    initializing,
    refreshing,
    loadingMore,
    onRefresh,
    handleEndReached,
  } = useShuffledProductFeed({
    categoryId: isManufacturers ? undefined : categoryId,
    subcategoryId: isManufacturers ? undefined : subcategoryId,
    sellerId: isManufacturers ? selectedSellerId ?? undefined : undefined,
    excludeProductIds: isManufacturers ? [] : advertisedIds,
    enabled: !adsLoading,
  });

  const {
    stores: featuredStores,
    loading: featuredLoading,
    refetch: refetchFeaturedStores,
  } = useFeaturedStores();

  const {
    sellers,
    loading: sellersLoading,
    refetch: refetchSellers,
  } = useSellers({
    storeType: "wholesale",
    enabled: isManufacturers,
  });

  const listData = useMemo<FeedRow[]>(() => {
    if (isManufacturers) {
      return visibleProducts;
    }
    if (adsLoading) return [];
    const adIdSet = new Set(advertisedIds);
    const organic = visibleProducts.filter((p) => !adIdSet.has(p.id));
    return [...advertisedProducts, ...organic];
  }, [
    isManufacturers,
    adsLoading,
    advertisedProducts,
    advertisedIds,
    visibleProducts,
  ]);

  const selectedSellerName = useMemo(() => {
    if (!selectedSellerId) return null;
    const seller = sellers.find((s) => s.id === selectedSellerId);
    return (
      seller?.store_name?.trim() ||
      seller?.full_name?.trim() ||
      "Seller"
    );
  }, [selectedSellerId, sellers]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchAds(),
      onRefresh(),
      refetchFeaturedStores(),
      isManufacturers ? refetchSellers() : Promise.resolve(),
    ]);
  }, [
    refetchAds,
    onRefresh,
    refetchFeaturedStores,
    isManufacturers,
    refetchSellers,
  ]);

  const feedTitle = useMemo(() => {
    if (isManufacturers) {
      return selectedSellerName
        ? `${selectedSellerName}'s products`
        : "Products from sellers";
    }
    if (!selectedCategoryId) return "All Products";
    return selectedSubcategoryId ? "Products" : "Category Products";
  }, [
    isManufacturers,
    selectedSellerName,
    selectedCategoryId,
    selectedSubcategoryId,
  ]);

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
      columns={gridColumns}
      contentInset={LIST_INSET}
      columnGap={columnGap}
    />
  );

  const flatHeaderSection = useMemo(() => {
    if (isManufacturers) {
      return (
        <View>
          {isWholesale ? (
            <WholesalePromoBanner href="/featuredRequest" />
          ) : null}

          <SellerFilterBar
            sellers={sellers}
            loading={sellersLoading}
            selectedSellerId={selectedSellerId}
            onSelectSeller={setSelectedSellerId}
          />

          <View style={styles.sectionHead}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.recommendedHeading}>{feedTitle}</Text>
              <View style={styles.sectionSpacer} />
              <GridColumnSwitcher
                value={gridColumns}
                onChange={setGridColumns}
              />
            </View>
            {!selectedSellerId ? (
              <Text style={styles.sectionHint}>
                Showing all seller products · tap a store to filter
              </Text>
            ) : null}
          </View>
        </View>
      );
    }

    return (
      <View>
        {isWholesale ? <WholesalePromoBanner href="/featuredRequest" /> : null}

        <HomeCategories
          selectedCategoryId={selectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId}
          onSelectCategory={setSelectedCategoryId}
          onSelectSubcategory={setSelectedSubcategoryId}
          expanded={categoriesExpanded}
          onToggleExpanded={toggleCategoriesExpanded}
        />

        <QuickActionsRow
          onBrowseSellers={() => setHomeMode("manufacturers")}
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
            <View style={styles.sectionSpacer} />
            <GridColumnSwitcher
              value={gridColumns}
              onChange={setGridColumns}
            />
          </View>
          {advertisedProducts.length > 0 ? (
            <Text style={styles.sectionHint}>
              Promoted products shown first · refreshed randomly
            </Text>
          ) : null}
        </View>
      </View>
    );
  }, [
    isManufacturers,
    isWholesale,
    sellers,
    sellersLoading,
    selectedSellerId,
    feedTitle,
    gridColumns,
    setGridColumns,
    selectedCategoryId,
    selectedSubcategoryId,
    categoriesExpanded,
    toggleCategoriesExpanded,
    setHomeMode,
    featuredStores,
    featuredLoading,
    advertisedProducts.length,
  ]);

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
        <TopBar activeMode={homeMode} onModeChange={setHomeMode} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f5832b" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TopBar activeMode={homeMode} onModeChange={setHomeMode} />
      <View style={styles.mainContainer}>
        <FlatList
          key={`grid-${homeMode}-${gridColumns}-${selectedSellerId ?? "all"}`}
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item.isSponsored ? `ad-${item.id}` : item.id.toString()
          }
          ListHeaderComponent={flatHeaderSection}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>
                {selectedSellerId
                  ? "No products from this seller"
                  : "No products found"}
              </Text>
              <Text style={styles.emptyBody}>
                {selectedSellerId
                  ? "Try another seller or open their profile."
                  : "Try another category or pull to refresh."}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={gridColumns}
          columnWrapperStyle={[styles.productWrap, { gap: columnGap }]}
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
    flexShrink: 1,
  },
  sectionSpacer: {
    flex: 1,
    minWidth: 8,
  },
  sectionHint: {
    marginTop: 4,
    marginLeft: 2,
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  productWrap: {
    flexDirection: "row",
    justifyContent: "flex-start",
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
