import HtmlRender from "@/components/htmlRender/HtmlRenter";
import { supabase } from "@/lib/supabase";
import { styles } from "@/styles/product";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

/* ================= TYPES ================= */

type Product = {
    id: number;
    name: string;
    price: string;
    moq: number;
    description: string;
    seller_id: string;
    product_images: {
        image_url: string;
        is_main: boolean;
    }[];
    seller: {
        id: string;
        store_name: string;
        avatar_url: string | null;
    } | null;
};

type Variant = {
    id: string;
    color: string;
};

type Size = {
    id: string;
    size: string;
    stock: number;
    variant_id: string;
};

/* ================= COMPONENT ================= */

const ProductPreview = () => {
    const [storeType, setStoreType] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const { id } = useLocalSearchParams<{ id: string }>();
    const { width } = useWindowDimensions();
    const navigation = useNavigation();

    const [activeColor, setActiveColor] = useState(0);
    const [searchVal, setSearchVal] = useState("");

    const [selectedQty, setSelectedQty] = useState<
        Record<string, Record<string, number>>
    >({});

    /* ================= PRODUCT ================= */

    const fetchProduct = async () => {
        if (!id) return;

        const { data, error } = await supabase
            .from("products")
            .select(`
                id,
                name,
                price,
                moq,
                description,
                seller_id,
                product_images (
                    image_url,
                    is_main
                ),
                seller:profiles (
                    id,
                    store_name,
                    avatar_url
                )
            `)
            .eq("id", id)
            .single();

        if (error) {
            if (__DEV__) {
                console.log(error);
            }
            return
        }

        setProduct({
            ...data,
            seller: Array.isArray(data.seller)
                ? data.seller[0]
                : data.seller,
        });
    };

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("profiles")
            .select("store_type")
            .eq("id", user.id)
            .single();

        if (data) setStoreType(data.store_type);
    };


    // 1. Calculate the total selected quantity across all variants/sizes
    const totalQty = Object.values(selectedQty).reduce((acc, variantSizes) => {
        return acc + Object.values(variantSizes).reduce((sum, q) => sum + q, 0);
    }, 0);

    const isBelowMoq = totalQty > 0 && totalQty < (product?.moq || 0);

    /* ================= VARIANTS ================= */

    const fetchVariants = async () => {
        if (!id) return;

        const { data: vData, error: vError } = await supabase
            .from("product_variants")
            .select("id, color")
            .eq("product_id", id);

        if (vError) return console.log(vError);

        const variantsSafe = vData || [];

        const { data: sData, error: sError } = await supabase
            .from("product_sizes")
            .select("id, size, stock, variant_id")
            .in(
                "variant_id",
                variantsSafe.map((v) => v.id)
            );

        if (sError) return console.log(sError);

        setVariants(variantsSafe);
        setSizes(sData || []);
    };

    /* ================= INIT ================= */

    useEffect(() => {
        fetchProduct();
        fetchVariants();
        fetchCurrentUser();
    }, [id]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchProduct(), fetchVariants()]);
        setRefreshing(false);
    };

    const currentVariant = variants[activeColor];

    const getSizesForVariant = (variantId: string) => {
        return sizes.filter((s) => s.variant_id === variantId);
    };

    /* ================= QTY ================= */

    const getQty = (variantId: string, sizeId: string) =>
        selectedQty?.[variantId]?.[sizeId] || 0;

    const updateQty = (
        variantId: string,
        sizeId: string,
        stock: number,
        diff: number
    ) => {
        setSelectedQty((prev) => {
            const current = prev?.[variantId]?.[sizeId] || 0;
            const next = Math.max(0, Math.min(stock, current + diff));

            return {
                ...prev,
                [variantId]: {
                    ...prev[variantId],
                    [sizeId]: next,
                },
            };
        });
    };

    const setQty = (
        variantId: string,
        sizeId: string,
        stock: number,
        value: string
    ) => {
        const num = parseInt(value || "0");
        if (isNaN(num)) return;

        const safe = Math.max(0, Math.min(stock, num));

        setSelectedQty((prev) => ({
            ...prev,
            [variantId]: {
                ...prev[variantId],
                [sizeId]: safe,
            },
        }));
    };


    const buildCheckoutPayload = () => {
        if (!product) return null;

        const items: any[] = [];

        Object.entries(selectedQty).forEach(([variantId, sizes]) => {
            Object.entries(sizes).forEach(([sizeId, qty]) => {
                if (qty > 0) {
                    items.push({
                        variant_id: variantId,
                        size_id: sizeId,
                        quantity: qty,
                    });
                }
            });
        });

        if (items.length === 0) return null;

        return {
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                moq: product.moq,
            },
            seller: product.seller,
            items,
        };
    };

    /* ================= UI ================= */

    if (!product) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const mainImage = product.product_images?.find((i) => i.is_main);
    const images = product.product_images
        ? [
            ...product.product_images.filter(i => i.is_main),   // main first
            ...product.product_images.filter(i => !i.is_main),  // others after
        ]
        : [];

    const handleSearch = () => {
        if (!searchVal?.trim()) return

        router.push({
            pathname: '/search/[query]',
            params: { query: searchVal }
        })
    }

    const calculatedWidth = width - 80;

    return (
        <View style={{ flex: 1 }}>

            {/* HEADER */}
            <View style={styles.productHead}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image
                        source={require("@/assets/images/icons/chevron-right.png")}
                        style={styles.backIcon}
                    />
                </Pressable>

                <View style={{ ...styles.searchWrapper, width: calculatedWidth }}>
                    <TextInput
                        style={styles.searchInp}
                        placeholder="Search For Products"
                        placeholderTextColor="#9CA3AF"
                        value={searchVal}
                        onChangeText={setSearchVal}
                        returnKeyType="search"
                        onSubmitEditing={() => {
                            handleSearch();
                        }}
                    />
                </View>
            </View>

            {/* BODY */}
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >

                {/* IMAGE */}
                {/* <View style={styles.imageWrapper}>
                    <Image
                        source={
                            mainImage?.image_url
                                ? { uri: mainImage.image_url }
                                : require("@/assets/images/product1.png")
                        }
                        style={styles.productImg}
                    />
                </View> */}
                <View style={styles.imageWrapper}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                    >
                        {images.length > 0 ? (
                            images.map((img, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: img.image_url }}
                                    style={[
                                        styles.productImg,
                                        { width: width } // full screen swipe
                                    ]}
                                    resizeMode="cover"
                                />
                            ))
                        ) : (
                            <Image
                                source={require("@/assets/images/product1.png")}
                                style={[styles.productImg, { width: width }]}
                            />
                        )}
                    </ScrollView>
                </View>

                {/* PRICE */}
                <View style={styles.productInfo}>
                    <View style={styles.productPriceWrapper}>
                        <Text style={styles.productPrice}>
                            BDT {product.price}
                        </Text>
                        <Text style={styles.moq}>
                            Min. order {product.moq} pieces
                        </Text>
                    </View>

                    <Text style={styles.productTitle}>
                        {product.name}
                    </Text>
                </View>

                {/* SELLER */}
                <View style={styles.storeWrapper}>
                    <View style={styles.storeImgWrapper}>
                        <Image
                            source={
                                product.seller?.avatar_url
                                    ? { uri: product.seller.avatar_url }
                                    : require('@/assets/images/store1.jpg')
                            }
                            style={styles.storeImg}
                        />
                    </View>

                    <View>
                        <Text style={styles.storeTitle}>
                            {product.seller?.store_name || "Unknown Seller"}
                        </Text>

                        <Pressable
                            onPress={
                                () => {
                                    router.push({
                                        pathname: "/publicProfile/[id]",
                                        params: {
                                            id: product.seller_id
                                        },
                                    });
                                }
                            }
                            style={styles.visitWrapper}
                        >
                            <Text style={styles.visitText}>Visit Store</Text>
                            <Image
                                source={require('@/assets/images/icons/chevron-right.png')}
                                style={styles.visitIcon}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* VARIANTS */}
                <View style={styles.sizeWrapper}>

                    {/* COLORS */}
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        {variants.map((v, i) => (
                            <Pressable
                                key={v.id}
                                onPress={() => setActiveColor(i)}
                                style={{
                                    padding: 10,
                                    borderWidth: activeColor === i ? 2 : 1,
                                    borderRadius: 8,
                                }}
                            >
                                <Text>{v.color}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* SIZES (FIXED RELATION LOGIC) */}
                    {currentVariant &&
                        getSizesForVariant(currentVariant.id).map((size) => {
                            const qty = getQty(currentVariant.id, size.id);

                            return (
                                <View key={size.id} style={styles.sizeItem}>
                                    <Text>
                                        {size.size} (Stock {size.stock})
                                    </Text>

                                    <View style={styles.sizeController}>
                                        <Pressable
                                            onPress={() =>
                                                updateQty(
                                                    currentVariant.id,
                                                    size.id,
                                                    size.stock,
                                                    -1
                                                )
                                            }
                                        >
                                            <Text style={{ fontSize: 20 }}>-</Text>
                                        </Pressable>

                                        <TextInput
                                            placeholderTextColor="#9CA3AF"
                                            value={String(qty)}
                                            keyboardType="numeric"
                                            style={styles.sizeCount}
                                            onChangeText={(v) =>
                                                setQty(
                                                    currentVariant.id,
                                                    size.id,
                                                    size.stock,
                                                    v
                                                )
                                            }
                                        />

                                        <Pressable
                                            onPress={() =>
                                                updateQty(
                                                    currentVariant.id,
                                                    size.id,
                                                    size.stock,
                                                    1
                                                )
                                            }
                                        >
                                            <Text style={{ fontSize: 20 }}>+</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })}
                </View>

                {/* DESCRIPTION */}
                <View style={styles.deliveryWrapper}>
                    <Text style={styles.deliveryHeadingText}>
                        Product Description
                    </Text>
                    <View style={styles.deliveryDetails}>
                        <HtmlRender html={product.description} />
                    </View>
                </View>

            </ScrollView >

            {/* ACTION */}
            < View style={styles.productAct} >
                <Pressable
                    style={[
                        styles.productActOrder,
                        storeType === "wholesale" && { backgroundColor: "#ccc" }
                    ]}
                    disabled={storeType === "wholesale"}
                    onPress={() => {
                        // 1. Calculate total selected quantity
                        const totalQty = Object.values(selectedQty).reduce((acc, variantSizes) => {
                            return acc + Object.values(variantSizes).reduce((sum, q) => sum + q, 0);
                        }, 0);

                        // 2. Handle Case: No items selected
                        if (totalQty === 0) {
                            alert("Please select at least one item");
                            return;
                        }

                        // 3. Handle Case: Below Minimum Order Amount
                        if (totalQty < product.moq) {
                            alert(`Minimum order amount not reached. You need at least ${product.moq} pieces to proceed (Current: ${totalQty})`);
                            return;
                        }

                        // 4. Proceed to Checkout
                        const payload = buildCheckoutPayload();
                        if (payload) {
                            router.push({
                                pathname: "/checkout",
                                params: {
                                    data: JSON.stringify({
                                        product,
                                        seller_id: product.seller_id,
                                        selectedQty,
                                        variants,
                                        sizes,
                                    }),
                                },
                            });
                        }
                    }}
                >
                    <Text style={styles.productActOrderText}>
                        {storeType === "wholesale" ? "Only Retailers Can Order" : "Order Now"}
                    </Text>
                </Pressable>
            </View >

        </View >
    );
};

export default ProductPreview;