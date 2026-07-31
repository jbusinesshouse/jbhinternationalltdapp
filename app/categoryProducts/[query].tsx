import SingleProduct from "@/components/SingleProduct";
import { useAdvertisedProducts } from "@/hooks/useAdvertisedProducts";
import { useShuffledProductFeed } from "@/hooks/useShuffledProductFeed";
import { AdvertisedProduct } from "@/lib/productAds";
import { ProductFeedItem } from "@/lib/productFeed";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SubCategory = {
  id: string;
  name: string;
};

type FeedRow = (ProductFeedItem | AdvertisedProduct) & {
  isSponsored?: boolean;
};

export default function CategoryProducts() {
  const { query, name } = useLocalSearchParams();

  const [searchVal, setSearchVal] = useState("");
  const categoryId = Array.isArray(query) ? query[0] : query;

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSub, setSelectedSub] = useState<string>("all");

  const subcategoryId = selectedSub !== "all" ? selectedSub : undefined;

  const {
    products: advertisedProducts,
    productIds: advertisedIds,
    loading: adsLoading,
    refetch: refetchAds,
  } = useAdvertisedProducts({
    categoryId,
    subcategoryId,
    enabled: !!categoryId,
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
    enabled: !!categoryId && !adsLoading,
  });

  const listData = useMemo<FeedRow[]>(() => {
    if (adsLoading) return [];
    const adIdSet = new Set(advertisedIds);
    const organic = visibleProducts.filter((p) => !adIdSet.has(p.id));
    return [...advertisedProducts, ...organic];
  }, [adsLoading, advertisedProducts, advertisedIds, visibleProducts]);

  const PRIMARY_COLOR = "#f5832b";

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("subcategories")
          .select("id, name")
          .eq("category_id", categoryId);

        if (error) {
          if (__DEV__) {
            console.error("Subcategory error:", error);
          }
          return;
        }

        if (data) {
          setSubCategories([{ id: "all", name: "All" }, ...data]);
        }
      } catch (err) {
        if (__DEV__) {
          console.error("Subcategory fetch failed:", err);
        }
      }
    };

    if (categoryId) {
      fetchSubCategories();
      setSelectedSub("all");
    }
  }, [categoryId]);

  const handleInp = (text: string) => {
    setSearchVal(text);
  };

  const handleSearch = () => {
    if (!searchVal?.trim()) return;

    router.push({
      pathname: "/search/[query]",
      params: { query: searchVal },
    });
  };

  const handleRefresh = async () => {
    await Promise.all([refetchAds(), onRefresh()]);
  };

  const renderSubCategory = ({ item }: { item: SubCategory }) => {
    const isActive = selectedSub === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.subChip,
          isActive && {
            backgroundColor: PRIMARY_COLOR,
            borderColor: PRIMARY_COLOR,
          },
        ]}
        onPress={() => setSelectedSub(item.id)}
      >
        <Text style={[styles.subText, isActive && { color: "#FFF" }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: FeedRow }) => (
    <SingleProduct
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
  );

  const listFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={PRIMARY_COLOR} />
      </View>
    );
  };

  const showLoader = (adsLoading || initializing) && listData.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInp}
            placeholder="Search For Products"
            placeholderTextColor="#9CA3AF"
            value={searchVal}
            onChangeText={(text) => handleInp(text)}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Image
              source={require("@/assets/images/icons/search.png")}
              style={styles.searchImg}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{name || "Products"}</Text>

        <FlatList
          data={subCategories}
          renderItem={renderSubCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subList}
        />
      </View>

      {showLoader ? (
        <ActivityIndicator
          color={PRIMARY_COLOR}
          size="large"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={listData}
          renderItem={renderProduct}
          keyExtractor={(item) =>
            item.isSponsored ? `ad-${item.id}` : item.id.toString()
          }
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            advertisedProducts.length > 0 ? (
              <Text style={styles.sponsoredHint}>
                Promoted products shown first · refreshed randomly
              </Text>
            ) : null
          }
          ListFooterComponent={listFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={PRIMARY_COLOR}
              colors={[PRIMARY_COLOR]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No products found in this category.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  searchWrapper: {
    width: "100%",
    position: "relative",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  searchInp: {
    height: 50,
    borderRadius: 10,
    paddingLeft: 15,
    paddingRight: 75,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  searchBtn: {
    width: 55,
    height: 40,
    backgroundColor: "#f5832b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    position: "absolute",
    top: 5,
    right: 25,
  },
  searchImg: {
    width: 23,
    height: 23,
    filter: "invert(1)",
  },
  header: {
    backgroundColor: "#FFF",
    paddingTop: 60,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF3",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    paddingHorizontal: 20,
    marginBottom: 15,
    color: "#1A1A1A",
  },
  subList: {
    paddingHorizontal: 15,
  },
  subChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: 5,
    backgroundColor: "#FFF",
  },
  subText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777",
  },
  productList: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  sponsoredHint: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 12,
    marginLeft: 2,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});
