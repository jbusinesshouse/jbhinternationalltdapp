import HtmlRender from "@/components/htmlRender/HtmlRenter";
import RelatedProductsSection from "@/components/product/RelatedProductsSection";
import { useUser } from "@/context/UserContext";
import { findOrCreateChatRoom } from "@/lib/chat";
import {
    ProductReview,
    fetchProductRatingSummary,
    fetchReviewsForProduct,
} from "@/lib/productReviews";
import { supabase } from "@/lib/supabase";
import { styles } from "@/styles/product";
import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ================= TYPES ================= */

type Product = {
    id: number;
    name: string;
    price: string;
    moq: number;
    description: string;
    seller_id: string;
    category_id: string | null;
    subcategory_id: string | null;
    selected_category: string | null;
    product_images: {
        image_url: string;
        is_main: boolean;
    }[];
    seller: {
        id: string;
        store_name: string;
        avatar_url: string | null;
    } | null;
    categories: { id: string; name: string } | null;
    subcategories: { id: string; name: string } | null;
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

type DotsIndicatorProps = {
    count: number;
    activeIndex: number;
    containerStyle?: object;
};

const DotsIndicator = ({ count, activeIndex, containerStyle }: DotsIndicatorProps) => {
    if (count <= 1) return null;

    return (
        <View style={[styles.dotsContainer, containerStyle]}>
            {Array.from({ length: count }).map((_, i) => (
                <View
                    key={i}
                    style={[styles.dot, activeIndex === i && styles.dotActive]}
                />
            ))}
        </View>
    );
};

/* ================= COMPONENT ================= */

const ProductPreview = () => {
    const { profile, user } = useUser();

    const [storeType, setStoreType] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [textSellerLoading, setTextSellerLoading] = useState(false);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
    const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
    const [relatedRefreshKey, setRelatedRefreshKey] = useState(0);

    const { id } = useLocalSearchParams<{ id: string }>();
    const { width, height } = useWindowDimensions();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const galleryScrollRef = useRef<ScrollView>(null);

    const [activeColor, setActiveColor] = useState(0);
    const [searchVal, setSearchVal] = useState("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [galleryVisible, setGalleryVisible] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

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
                category_id,
                subcategory_id,
                selected_category,
                product_images (
                    image_url,
                    is_main
                ),
                seller:profiles (
                    id,
                    store_name,
                    avatar_url
                ),
                categories (
                    id,
                    name
                ),
                subcategories (
                    id,
                    name
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
            categories: Array.isArray(data.categories)
                ? data.categories[0] ?? null
                : data.categories ?? null,
            subcategories: Array.isArray(data.subcategories)
                ? data.subcategories[0] ?? null
                : data.subcategories ?? null,
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

    const fetchReviews = async () => {
        if (!id) return;

        try {
            const [list, summary] = await Promise.all([
                fetchReviewsForProduct(String(id)),
                fetchProductRatingSummary(String(id)),
            ]);
            setReviews(list);
            setRatingSummary(summary);
        } catch (err) {
            if (__DEV__) {
                console.log("Fetch reviews error:", err);
            }
        }
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
        fetchReviews();
    }, [id]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchProduct(), fetchVariants(), fetchReviews()]);
        setRelatedRefreshKey((k) => k + 1);
        setRefreshing(false);
    };

    useEffect(() => {
        if (!galleryVisible) return;

        requestAnimationFrame(() => {
            galleryScrollRef.current?.scrollTo({
                x: galleryIndex * width,
                animated: false,
            });
        });
    }, [galleryVisible, galleryIndex, width]);

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

    const images = product.product_images
        ? [
            ...product.product_images.filter(i => i.is_main),
            ...product.product_images.filter(i => !i.is_main),
        ]
        : [];

    const displayImages = images.length > 0
        ? images.map((img) => img.image_url)
        : [null];

    const handleImageScroll = (
        e: NativeSyntheticEvent<NativeScrollEvent>,
        setter: (index: number) => void
    ) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setter(index);
    };

    const openGallery = (index: number) => {
        setGalleryIndex(index);
        setGalleryVisible(true);
    };

    const handleSearch = () => {
        if (!searchVal?.trim()) return

        router.push({
            pathname: '/search/[query]',
            params: { query: searchVal }
        })
    }

    const handleTextSeller = async () => {
        if (!product || !user) {
            Alert.alert('Sign in required', 'Please sign in to message the seller.');
            return;
        }

        if (user.id === product.seller_id) {
            Alert.alert('Unavailable', 'You cannot message yourself about your own product.');
            return;
        }

        setTextSellerLoading(true);

        const mainImage = product.product_images?.find((img) => img.is_main)?.image_url
            ?? product.product_images?.[0]?.image_url
            ?? null;

        const result = await findOrCreateChatRoom(
            user.id,
            product.seller_id,
            {
                productId: String(product.id),
                name: product.name,
                price: String(product.price),
                moq: product.moq,
                imageUrl: mainImage,
            },
        );

        setTextSellerLoading(false);

        if ('error' in result) {
            Alert.alert('Could not start chat', result.error);
            return;
        }

        router.push({
            pathname: '/messages/[id]',
            params: {
                id: result.roomId,
                productName: product.name,
                productId: String(product.id),
                otherPartyName: product.seller?.store_name ?? 'Seller',
                otherPartyAvatar: product.seller?.avatar_url ?? '',
                otherPartyId: product.seller_id,
            },
        });
    };

    const calculatedWidth = width - 80;
    const isOwnProduct = user?.id === product?.seller_id;

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
                <View style={styles.imageWrapper}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => handleImageScroll(e, setActiveImageIndex)}
                    >
                        {displayImages.map((imageUrl, index) => (
                            <Pressable
                                key={index}
                                onPress={() => openGallery(index)}
                                style={{ width }}
                            >
                                <Image
                                    source={
                                        imageUrl
                                            ? { uri: imageUrl }
                                            : require("@/assets/images/product1.png")
                                    }
                                    style={[styles.productImg, { width }]}
                                    resizeMode="cover"
                                />
                            </Pressable>
                        ))}
                    </ScrollView>

                    <DotsIndicator
                        count={displayImages.length}
                        activeIndex={activeImageIndex}
                    />
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

                    {(product.categories?.name ||
                        product.subcategories?.name ||
                        product.selected_category) && (
                        <View style={styles.categoryRow}>
                            {product.categories?.name ? (
                                <View style={styles.categoryChip}>
                                    <Text style={styles.categoryChipText}>
                                        {product.categories.name}
                                    </Text>
                                </View>
                            ) : null}

                            {(product.subcategories?.name ||
                                product.selected_category) &&
                            product.categories?.name ? (
                                <Text style={styles.categorySeparator}>›</Text>
                            ) : null}

                            {product.subcategories?.name ||
                            product.selected_category ? (
                                <View style={styles.subcategoryChip}>
                                    <Text style={styles.subcategoryChipText}>
                                        {product.subcategories?.name ||
                                            product.selected_category}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    )}

                    {ratingSummary.count > 0 && (
                        <View style={styles.ratingWrapper}>
                            <Text style={styles.ratingText}>
                                {ratingSummary.average.toFixed(1)} ({ratingSummary.count})
                            </Text>
                            <Image
                                source={require("@/assets/images/icons/star.png")}
                                style={styles.ratingStar}
                            />
                        </View>
                    )}
                </View>

                {/* SELLER — entire card opens store */}
                <Pressable
                    style={styles.storeWrapper}
                    onPress={() => {
                        if (!product.seller_id) return;
                        router.push({
                            pathname: "/publicProfile/[id]",
                            params: { id: product.seller_id },
                        });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Visit ${product.seller?.store_name || "store"}`}
                >
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

                    <View style={{ flex: 1 }}>
                        <Text style={styles.storeTitle}>
                            {product.seller?.store_name || "Unknown Seller"}
                        </Text>

                        <View style={styles.visitWrapper}>
                            <Text style={styles.visitText}>Visit Store</Text>
                            <Image
                                source={require('@/assets/images/icons/chevron-right.png')}
                                style={styles.visitIcon}
                            />
                        </View>
                    </View>
                </Pressable>

                {/* VARIANTS */}
                <View style={styles.sizeWrapper}>

                    {/* COLORS */}
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                        {variants.map((v, i) => (
                            <Pressable
                                key={v.id}
                                onPress={() => setActiveColor(i)}
                                style={{
                                    padding: 10,
                                    borderWidth: activeColor === i ? 2 : 1,
                                    borderRadius: 8,
                                    maxWidth: "100%",
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
                                    <Text style={styles.sizeItemIndic}>
                                        {size.size} (Stock {size.stock})
                                    </Text>

                                    <View style={styles.sizeController}>
                                        <Pressable
                                            style={styles.sizeConBtn}
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
                                            style={styles.sizeConBtn}
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

                {/* REVIEWS */}
                <View style={styles.deliveryWrapper}>
                    <Text style={styles.deliveryHeadingText}>
                        Reviews{ratingSummary.count > 0 ? ` (${ratingSummary.count})` : ""}
                    </Text>

                    {reviews.length === 0 ? (
                        <Text style={{ fontSize: 13, color: "#888", paddingVertical: 8 }}>
                            No reviews yet.
                        </Text>
                    ) : (
                        reviews.map((review) => (
                            <View
                                key={review.id}
                                style={{
                                    paddingVertical: 12,
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#f0f0f0",
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginBottom: 6,
                                    }}
                                >
                                    <Image
                                        source={
                                            review.buyer?.avatar_url
                                                ? { uri: review.buyer.avatar_url }
                                                : require("@/assets/images/icons/default-avatar.png")
                                        }
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 14,
                                            marginRight: 8,
                                            backgroundColor: "#eee",
                                        }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "600", color: "#111" }}>
                                            {review.buyer?.full_name || "Buyer"}
                                        </Text>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Image
                                                    key={star}
                                                    source={require("@/assets/images/icons/star.png")}
                                                    style={{
                                                        width: 12,
                                                        height: 12,
                                                        opacity: star <= review.rating ? 1 : 0.2,
                                                    }}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 11, color: "#999" }}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </Text>
                                </View>

                                {!!review.comment && (
                                    <Text style={{ fontSize: 13, color: "#444", lineHeight: 19 }}>
                                        {review.comment}
                                    </Text>
                                )}

                                {review.image_urls?.length > 0 && (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={{ marginTop: 8 }}
                                        contentContainerStyle={{ gap: 8 }}
                                    >
                                        {review.image_urls.map((url, idx) => (
                                            <Pressable
                                                key={`${review.id}-${idx}`}
                                                onPress={() => setReviewImagePreview(url)}
                                            >
                                                <Image
                                                    source={{ uri: url }}
                                                    style={{
                                                        width: 64,
                                                        height: 64,
                                                        borderRadius: 8,
                                                        backgroundColor: "#eee",
                                                    }}
                                                />
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        ))
                    )}
                </View>


                <View style={{ paddingVertical: 15, paddingHorizontal: 15, }}>
                    <Pressable
                        style={styles.reportBtn}
                        onPress={
                            () => {
                                router.push({
                                    pathname: "/report/[id]",
                                    params: { id: product.id, type: 'product' }
                                })
                            }
                        }
                    >
                        <Image
                            source={(require('@/assets/images/icons/flag.png'))}
                            style={{ width: 15, height: 15, marginRight: 8, }}
                        />
                        <Text style={{ fontSize: 12, }}>Report an issue!</Text>
                    </Pressable>
                </View>

                <RelatedProductsSection
                    productId={String(product.id)}
                    categoryId={product.category_id}
                    refreshKey={relatedRefreshKey}
                />

            </ScrollView >

            {/* ACTION */}
            <View style={styles.productAct}>
                {!isOwnProduct && (
                    <Pressable
                        style={[
                            styles.productActTextSeller,
                            textSellerLoading && { opacity: 0.7 },
                        ]}
                        disabled={textSellerLoading}
                        onPress={handleTextSeller}
                    >
                        {textSellerLoading ? (
                            <ActivityIndicator size="small" color="#f5832b" />
                        ) : (
                            <Text style={styles.productActTextSellerText}>Text Seller</Text>
                        )}
                    </Pressable>
                )}

                <Pressable
                    style={[
                        styles.productActOrder,
                        isOwnProduct && { width: '100%' },
                        // Disable styling if wholesale OR if account is not active
                        (storeType === "wholesale" || (profile?.status && profile.status !== 'active')) &&
                        { backgroundColor: "#ccc" }
                    ]}
                    // Disable interaction if wholesale OR if account is not active
                    disabled={storeType === "wholesale" || (profile?.status && profile.status !== 'active')}
                    onPress={() => {
                        // 0. Double check status in onPress (Safety check)
                        if (profile?.status && profile.status !== 'active') {
                            alert(`Your account is ${profile.status}. You cannot place orders at this time.`);
                            return;
                        }

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
                            alert(`Minimum order amount not reached. You need at least ${product.moq} pieces to proceed.`);
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
                        {/* Dynamic Labeling */}
                        {profile?.status === 'freeze'
                            ? "Account Frozen"
                            : profile?.status === 'restricted'
                                ? "Account Restricted"
                                : storeType === "wholesale"
                                    ? "Only Retailers Can Order"
                                    : "Order Now"}
                    </Text>
                </Pressable>
            </View>

            <Modal
                visible={galleryVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setGalleryVisible(false)}
            >
                <View style={styles.galleryOverlay}>
                    <Pressable
                        style={[
                            styles.galleryCloseBtn,
                            { top: insets.top + 12 },
                        ]}
                        onPress={() => setGalleryVisible(false)}
                    >
                        <Feather name="x" size={24} color="#ffffff" />
                    </Pressable>

                    <ScrollView
                        ref={galleryScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => handleImageScroll(e, setGalleryIndex)}
                    >
                        {displayImages.map((imageUrl, index) => (
                            <View
                                key={index}
                                style={{
                                    width,
                                    height,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Image
                                    source={
                                        imageUrl
                                            ? { uri: imageUrl }
                                            : require("@/assets/images/product1.png")
                                    }
                                    style={styles.galleryImage}
                                    resizeMode="contain"
                                />
                            </View>
                        ))}
                    </ScrollView>

                    <DotsIndicator
                        count={displayImages.length}
                        activeIndex={galleryIndex}
                        containerStyle={styles.galleryDotsContainer}
                    />
                </View>
            </Modal>

            <Modal
                visible={!!reviewImagePreview}
                transparent
                animationType="fade"
                onRequestClose={() => setReviewImagePreview(null)}
            >
                <View style={styles.galleryOverlay}>
                    <Pressable
                        style={[
                            styles.galleryCloseBtn,
                            { top: insets.top + 12 },
                        ]}
                        onPress={() => setReviewImagePreview(null)}
                    >
                        <Feather name="x" size={24} color="#ffffff" />
                    </Pressable>
                    {reviewImagePreview ? (
                        <Image
                            source={{ uri: reviewImagePreview }}
                            style={styles.galleryImage}
                            resizeMode="contain"
                        />
                    ) : null}
                </View>
            </Modal>

        </View >
    );
};

export default ProductPreview;