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
    try {
      // 1. Get the current logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      let blockedUserIds: string[] = [];

      // 2. Fetch the list of blocked user IDs if the user is logged in
      if (user) {
        const { data: blockData, error: blockError } = await supabase
          .from('blocks')
          .select('blocked_id')
          .eq('blocker_id', user.id);

        if (!blockError && blockData) {
          // Extract IDs into a simple string array
          blockedUserIds = blockData.map((b: any) => b.blocked_id);
        }
      }

      // 3. Start building the products query
      let query = supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          moq,
          seller_id,
          product_images (
            image_url,
            is_main
          )
        `)
        .eq("is_deleted", false)
        .eq("status", "active");

      // 4. If there are blocked users, exclude their products
      if (blockedUserIds.length > 0) {
        // Format: .not('column', 'in', '(id1,id2,id3)')
        query = query.not('seller_id', 'in', `(${blockedUserIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // 5. Format the data for the UI
      const formattedProducts = data.map((product: any) => {
        const mainImage = product.product_images?.find(
          (img: any) => img.is_main === true
        );

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          moq: product.moq,
          productImg: mainImage?.image_url || null,
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      if (__DEV__) {
        console.log("Error fetching products:", error);
      }
    }
  };

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