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
  type HomeMode,
} from "@/hooks/useCatalogPrefs";
import { useFeaturedStores } from "@/hooks/useFeaturedStores";
import { useProfile } from "@/hooks/useProfile";
import { useSellers } from "@/hooks/useSellers";
import { useShuffledProductFeed } from "@/hooks/useShuffledProductFeed";
import { AdvertisedProduct } from "@/lib/productAds";
import { ProductFeedItem } from "@/lib/productFeed";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

type FeedRow = (ProductFeedItem | AdvertisedProduct) & {
  isSponsored?: boolean;
};

type RenderProps = {
  item: FeedRow;
};

const LIST_INSET = 24;
const MODE_ORDER: HomeMode[] = ["products", "manufacturers"];

function gapFor(columns: GridColumns) {
  if (columns === 4) return 6;
  if (columns === 3) return 8;
  return 12;
}

function modeToIndex(mode: HomeMode) {
  return MODE_ORDER.indexOf(mode);
}

export default function Index() {
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = Math.max(windowWidth, 1);

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
  const [manufacturersVisited, setManufacturersVisited] = useState(false);
  /** Pause Products↔Manufacturers pager while nested horizontal strips are touched */
  const [pagerScrollEnabled, setPagerScrollEnabled] = useState(true);

  const onNestedHorizontalFocus = useCallback((focused: boolean) => {
    setPagerScrollEnabled(!focused);
  }, []);

  const pagerRef = useRef<Animated.ScrollView>(null);
  const homeModeRef = useRef(homeMode);
  homeModeRef.current = homeMode;

  const scrollX = useSharedValue(modeToIndex(homeMode) * pageWidth);
  const pageWidthSV = useSharedValue(pageWidth);
  const mfgVisitMarked = useSharedValue(manufacturersVisited ? 1 : 0);

  const categoryId = selectedCategoryId ?? undefined;
  const subcategoryId = selectedSubcategoryId ?? undefined;
  const columnGap = gapFor(gridColumns);
  const isManufacturers = homeMode === "manufacturers";

  useEffect(() => {
    if (isManufacturers) setManufacturersVisited(true);
  }, [isManufacturers]);

  useEffect(() => {
    pageWidthSV.value = pageWidth;
    scrollX.value = modeToIndex(homeModeRef.current) * pageWidth;
  }, [pageWidth, pageWidthSV, scrollX]);

  useEffect(() => {
    if (manufacturersVisited) mfgVisitMarked.value = 1;
  }, [manufacturersVisited, mfgVisitMarked]);

  const {
    products: advertisedProducts,
    productIds: advertisedIds,
    loading: adsLoading,
    refetch: refetchAds,
  } = useAdvertisedProducts({
    categoryId,
    subcategoryId,
  });

  const productsFeed = useShuffledProductFeed({
    categoryId,
    subcategoryId,
    excludeProductIds: advertisedIds,
    enabled: !adsLoading,
  });

  const manufacturersFeed = useShuffledProductFeed({
    sellerId: selectedSellerId ?? undefined,
    enabled: manufacturersVisited,
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
    enabled: manufacturersVisited,
  });

  const productsListData = useMemo<FeedRow[]>(() => {
    if (adsLoading) return [];
    const adIdSet = new Set(advertisedIds);
    const organic = productsFeed.visibleProducts.filter(
      (p) => !adIdSet.has(p.id)
    );
    return [...advertisedProducts, ...organic];
  }, [
    adsLoading,
    advertisedProducts,
    advertisedIds,
    productsFeed.visibleProducts,
  ]);

  const manufacturersListData = useMemo<FeedRow[]>(
    () => manufacturersFeed.visibleProducts,
    [manufacturersFeed.visibleProducts]
  );

  const selectedSellerName = useMemo(() => {
    if (!selectedSellerId) return null;
    const seller = sellers.find((s) => s.id === selectedSellerId);
    return (
      seller?.store_name?.trim() ||
      seller?.full_name?.trim() ||
      "Seller"
    );
  }, [selectedSellerId, sellers]);

  const scrollToMode = useCallback(
    (mode: HomeMode, animated = true) => {
      pagerRef.current?.scrollTo({
        x: modeToIndex(mode) * pageWidth,
        y: 0,
        animated,
      });
    },
    [pageWidth]
  );

  const handleModeChange = useCallback(
    (mode: HomeMode) => {
      if (mode === "manufacturers") setManufacturersVisited(true);
      setHomeMode(mode);
      scrollToMode(mode, true);
    },
    [setHomeMode, scrollToMode]
  );

  // Keep pager aligned after rotation / width changes
  useEffect(() => {
    scrollToMode(homeModeRef.current, false);
  }, [pageWidth, scrollToMode]);

  const markManufacturersVisited = useCallback(() => {
    setManufacturersVisited(true);
  }, []);

  const handlePagerScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      "worklet";
      scrollX.value = e.contentOffset.x;
      const width = Math.max(pageWidthSV.value, 1);
      if (mfgVisitMarked.value === 0 && e.contentOffset.x > width * 0.08) {
        mfgVisitMarked.value = 1;
        runOnJS(markManufacturersVisited)();
      }
    },
  });

  const handlePagerScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth <= 0) return;
      const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
      const nextMode = MODE_ORDER[Math.max(0, Math.min(1, index))] ?? "products";
      if (nextMode === "manufacturers") setManufacturersVisited(true);
      if (nextMode !== homeMode) setHomeMode(nextMode);
    },
    [homeMode, pageWidth, setHomeMode]
  );

  const handleProductsRefresh = useCallback(async () => {
    await Promise.all([
      refetchAds(),
      productsFeed.onRefresh(),
      refetchFeaturedStores(),
    ]);
  }, [refetchAds, productsFeed.onRefresh, refetchFeaturedStores]);

  const handleManufacturersRefresh = useCallback(async () => {
    await Promise.all([manufacturersFeed.onRefresh(), refetchSellers()]);
  }, [manufacturersFeed.onRefresh, refetchSellers]);

  const renderItem = useCallback(
    ({ item }: RenderProps) => (
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
    ),
    [gridColumns, columnGap]
  );

  const productsHeader = useMemo(
    () => (
      <View>
        {isWholesale ? <WholesalePromoBanner href="/featuredRequest" /> : null}

        <HomeCategories
          selectedCategoryId={selectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId}
          onSelectCategory={setSelectedCategoryId}
          onSelectSubcategory={setSelectedSubcategoryId}
          expanded={categoriesExpanded}
          onToggleExpanded={toggleCategoriesExpanded}
          onNestedHorizontalFocus={onNestedHorizontalFocus}
        />

        <QuickActionsRow
          onBrowseSellers={() => handleModeChange("manufacturers")}
        />

        {!selectedCategoryId ? (
          <FeaturedStores
            stores={featuredStores}
            loading={featuredLoading}
            onNestedHorizontalFocus={onNestedHorizontalFocus}
          />
        ) : null}

        <View style={styles.sectionHead}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionBar} />
            <Text style={styles.recommendedHeading}>
              {!selectedCategoryId
                ? "All Products"
                : selectedSubcategoryId
                  ? "Products"
                  : "Category Products"}
            </Text>
            <View style={styles.sectionSpacer} />
            <GridColumnSwitcher
              value={gridColumns}
              onChange={setGridColumns}
            />
          </View>
          {productsFeed.filtering ? (
            <View style={styles.filterBusyRow}>
              <ActivityIndicator size="small" color="#f5832b" />
              <Text style={styles.sectionHint}>Updating products…</Text>
            </View>
          ) : advertisedProducts.length > 0 ? (
            <Text style={styles.sectionHint}>
              Promoted products shown first · refreshed randomly
            </Text>
          ) : null}
        </View>
      </View>
    ),
    [
      isWholesale,
      selectedCategoryId,
      selectedSubcategoryId,
      categoriesExpanded,
      toggleCategoriesExpanded,
      handleModeChange,
      featuredStores,
      featuredLoading,
      gridColumns,
      setGridColumns,
      advertisedProducts.length,
      onNestedHorizontalFocus,
      productsFeed.filtering,
    ]
  );

  const manufacturersHeader = useMemo(
    () => (
      <View>
        {isWholesale ? (
          <WholesalePromoBanner href="/featuredRequest" />
        ) : null}

        <SellerFilterBar
          sellers={sellers}
          loading={sellersLoading}
          selectedSellerId={selectedSellerId}
          onSelectSeller={setSelectedSellerId}
          onNestedHorizontalFocus={onNestedHorizontalFocus}
        />

        <View style={styles.sectionHead}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.recommendedHeading}>
              {selectedSellerName
                ? `${selectedSellerName}'s products`
                : "Products from sellers"}
            </Text>
            <View style={styles.sectionSpacer} />
            <GridColumnSwitcher
              value={gridColumns}
              onChange={setGridColumns}
            />
          </View>
          {!selectedSellerId ? (
            manufacturersFeed.filtering ? (
              <View style={styles.filterBusyRow}>
                <ActivityIndicator size="small" color="#f5832b" />
                <Text style={styles.sectionHint}>Updating products…</Text>
              </View>
            ) : (
              <Text style={styles.sectionHint}>
                Showing all seller products · tap a store to filter
              </Text>
            )
          ) : manufacturersFeed.filtering ? (
            <View style={styles.filterBusyRow}>
              <ActivityIndicator size="small" color="#f5832b" />
              <Text style={styles.sectionHint}>Updating products…</Text>
            </View>
          ) : null}
        </View>
      </View>
    ),
    [
      isWholesale,
      sellers,
      sellersLoading,
      selectedSellerId,
      selectedSellerName,
      gridColumns,
      setGridColumns,
      onNestedHorizontalFocus,
      manufacturersFeed.filtering,
    ]
  );

  const productsFooter = useCallback(() => {
    if (!productsFeed.loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#f5832b" />
      </View>
    );
  }, [productsFeed.loadingMore]);

  const manufacturersFooter = useCallback(() => {
    if (!manufacturersFeed.loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#f5832b" />
      </View>
    );
  }, [manufacturersFeed.loadingMore]);

  const showProductsLoader =
    (adsLoading || productsFeed.initializing) &&
    productsListData.length === 0 &&
    !productsFeed.filtering;

  const showManufacturersLoader =
    manufacturersVisited &&
    manufacturersFeed.initializing &&
    manufacturersListData.length === 0 &&
    !manufacturersFeed.filtering;

  return (
    <View style={styles.screen}>
      <TopBar
        activeMode={homeMode}
        onModeChange={handleModeChange}
        scrollX={scrollX}
        pageWidth={pageWidth}
      />

      <Animated.ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        scrollEnabled={pagerScrollEnabled}
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        onScroll={handlePagerScroll}
        onMomentumScrollEnd={handlePagerScrollEnd}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        <View style={[styles.page, { width: pageWidth }]}>
          {showProductsLoader ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f5832b" />
            </View>
          ) : (
            <FlatList
              key={`products-grid-${gridColumns}`}
              data={productsListData}
              renderItem={renderItem}
              keyExtractor={(item) =>
                item.isSponsored ? `ad-${item.id}` : item.id.toString()
              }
              ListHeaderComponent={productsHeader}
              ListFooterComponent={productsFooter}
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
              numColumns={gridColumns}
              columnWrapperStyle={
                productsListData.length === 0
                  ? undefined
                  : [styles.productWrap, { gap: columnGap }]
              }
              onEndReached={productsFeed.handleEndReached}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={productsFeed.refreshing}
                  onRefresh={handleProductsRefresh}
                  tintColor="#f5832b"
                  colors={["#f5832b"]}
                />
              }
            />
          )}
        </View>

        <View style={[styles.page, { width: pageWidth }]}>
          {!manufacturersVisited ? (
            <View style={styles.loadingContainer} />
          ) : showManufacturersLoader ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f5832b" />
            </View>
          ) : (
            <FlatList
              key={`mfg-grid-${gridColumns}`}
              data={manufacturersListData}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              ListHeaderComponent={manufacturersHeader}
              ListFooterComponent={manufacturersFooter}
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
                      : "Try another filter or pull to refresh."}
                  </Text>
                </View>
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              numColumns={gridColumns}
              columnWrapperStyle={
                manufacturersListData.length === 0
                  ? undefined
                  : [styles.productWrap, { gap: columnGap }]
              }
              onEndReached={manufacturersFeed.handleEndReached}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={manufacturersFeed.refreshing}
                  onRefresh={handleManufacturersRefresh}
                  tintColor="#f5832b"
                  colors={["#f5832b"]}
                />
              }
            />
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  pager: {
    flex: 1,
  },
  page: {
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
  filterBusyRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
