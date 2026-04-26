import SingleProduct from "@/components/SingleProduct";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList, RefreshControl, StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

type SubCategory = {
    id: string;
    name: string;
};

export default function CategoryProducts() {
    const { query, name } = useLocalSearchParams();

    const [searchVal, setSearchVal] = useState('')
    const [refreshing, setRefreshing] = useState(false);
    // ✅ FIX: ensure string (not array)
    const categoryId = Array.isArray(query) ? query[0] : query;

    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [selectedSub, setSelectedSub] = useState<string>("all");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const PRIMARY_COLOR = "#f5832b";

    // ✅ Fetch Subcategories
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
            setSelectedSub("all"); // ✅ reset filter on category change
        }
    }, [categoryId]);

    // ✅ Fetch Products
    useEffect(() => {
        if (!categoryId) return;
        fetchProducts();
    }, [categoryId, selectedSub]);

    const fetchProducts = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);

        try {
            // 1. Get current user and blocked list
            const { data: { user } } = await supabase.auth.getUser();
            let blockedUserIds: string[] = [];

            if (user) {
                const { data: blockData } = await supabase
                    .from('blocks')
                    .select('blocked_id')
                    .eq('blocker_id', user.id);

                if (blockData) {
                    blockedUserIds = blockData.map((b: any) => b.blocked_id);
                }
            }

            // 2. Initialize the query
            let queryBuilder = supabase
                .from("products")
                .select(`
                id, name, price, moq, category_id, subcategory_id, seller_id,
                product_images (image_url, is_main)
            `)
                .eq("category_id", categoryId)
                .eq('is_deleted', false)
                .eq("status", "active");

            // 3. Filter by subcategory if selected
            if (selectedSub !== "all") {
                queryBuilder = queryBuilder.eq("subcategory_id", selectedSub);
            }

            // 4. Apply the Block Filter if IDs exist
            if (blockedUserIds.length > 0) {
                queryBuilder = queryBuilder.not('seller_id', 'in', `(${blockedUserIds.join(',')})`);
            }

            const { data, error } = await queryBuilder;

            if (error) {
                if (__DEV__) console.error("Product error:", error);
                return;
            }

            if (data) {
                const formatted = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    moq: p.moq,
                    productImg:
                        p.product_images?.find((img: any) => img.is_main)?.image_url || null,
                }));

                setProducts(formatted);
            } else {
                setProducts([]);
            }
        } catch (err) {
            if (__DEV__) console.error("Fetch error:", err);
        } finally {
            if (!isRefresh) setLoading(false);
        }
    };

    const handleInp = (text: string) => {
        setSearchVal(text)
    }
    const handleSearch = () => {
        if (!searchVal?.trim()) return

        router.push({
            pathname: '/search/[query]',
            params: { query: searchVal }
        })
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProducts(true);
        setRefreshing(false);
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

    const renderProduct = ({ item }: any) => (
        <SingleProduct
            productId={item.id}
            title={item.name}
            price={item.price}
            moq={item.moq}
            productImg={
                item.productImg
                    ? { uri: item.productImg }
                    : require("@/assets/images/product1.png")
            }
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchWrapper}>
                    <TextInput
                        style={styles.searchInp}
                        placeholder='Search For Products'
                        placeholderTextColor="#9CA3AF"
                        value={searchVal}
                        onChangeText={(text) => handleInp(text)}
                    />
                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                        <Image
                            source={require('@/assets/images/icons/search.png')}
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

            {loading ? (
                <ActivityIndicator
                    color={PRIMARY_COLOR}
                    size="large"
                    style={styles.loader}
                />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.productRow}
                    contentContainerStyle={styles.productList}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
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
        backgroundColor: "#F9F9F9",
    },
    searchWrapper: {
        width: '100%',
        position: 'relative',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    searchInp: {
        height: 50,
        borderRadius: 8,
        paddingLeft: 15,
        paddingRight: 75,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        color: '#000000',
        backgroundColor: '#ffffff',
    },
    searchBtn: {
        width: 55,
        height: 40,
        backgroundColor: '#f5832b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        position: 'absolute',
        top: 5,
        right: 25,
    },
    searchImg: {
        width: 23,
        height: 23,
        filter: 'invert(1)',
    },
    header: {
        backgroundColor: "#FFF",
        paddingTop: 60,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
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
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 100,
    },
    productRow: {
        justifyContent: "space-between",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
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