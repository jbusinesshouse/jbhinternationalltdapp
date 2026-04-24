import TopBar from "@/components/home/TopBar";
import SingleProduct from "@/components/SingleProduct";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProductProps = {
  id: string;
  productImg: string | null;
  name: string;
  price: string;
  moq: number;
};

type RenderProps = {
  item: ProductProps;
};

export default function Index() {
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
      id,
      name,
      price,
      moq,
      product_images (
        image_url,
        is_main
      )
    `)
      .eq("is_deleted", false)

    if (error) {
      if (__DEV__) {
        console.log("Error fetching products:", error)
      }
      return
    }

    const formattedProducts = data.map((product: any) => {
      const mainImage = product.product_images?.find(
        (img: any) => img.is_main === true
      )

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        moq: product.moq,
        productImg: mainImage?.image_url || null,
      }
    })

    setProducts(formattedProducts)
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

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

  return (
    <View>
      <TopBar />
      <View style={styles.mainContainer}>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={flatHeaderSection}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.productWrap}

          // ✅ HERE is the refresh system
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
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
});