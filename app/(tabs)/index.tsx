import TopBar from "@/components/home/TopBar";
import SingleProduct from "@/components/SingleProduct";
import { useShuffledProductFeed } from "@/hooks/useShuffledProductFeed";
import { ProductFeedItem } from "@/lib/productFeed";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

type RenderProps = {
  item: ProductFeedItem;
};

export default function Index() {
  const {
    visibleProducts,
    initializing,
    refreshing,
    loadingMore,
    onRefresh,
    handleEndReached,
  } = useShuffledProductFeed();

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
    />
  );

  const flatHeaderSection = () => (
    <>
      {/* <TopDeals /> */}
      <Text style={styles.recommendedHeading}>All Products</Text>
    </>
  );

  const listFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#f5832b" />
      </View>
    );
  };

  if (initializing && visibleProducts.length === 0) {
    return (
      <View>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f5832b" />
        </View>
      </View>
    );
  }

  return (
    <View>
      <TopBar />
      <View style={styles.mainContainer}>
        <FlatList
          data={visibleProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={flatHeaderSection}
          ListFooterComponent={listFooter}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.productWrap}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingBottom: 350,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  recommendedHeading: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
  },
  productWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
