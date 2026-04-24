import { supabase } from "@/lib/supabase";
import { styles } from "@/styles/profile";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

/* ================= TYPES ================= */

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

type CheckoutData = {
    product: {
        id: string;
        name: string;
        price: string;
    };

    selectedQty: Record<string, Record<string, number>>;
    variants: Variant[];
    sizes: Size[];
};

/* ================= COMPONENT ================= */

const Checkout = () => {
    const navigation = useNavigation();
    const router = useRouter();

    const { data } = useLocalSearchParams<{ data: string }>();

    const parsed: CheckoutData | null = useMemo(() => {
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            if (__DEV__) {
                console.log("Invalid JSON:", e);
            }
            return null;
        }
    }, [data]);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        email: "",
        city: "",
        address: "",
    });

    if (!parsed) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Invalid checkout data</Text>
            </View>
        );
    }

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    /* ================= 🔔 SEND NOTIFICATION ================= */

    const sendNotification = async (
        userId: string,
        title: string,
        message: string,
        orderId: string
    ) => {
        const { error } = await supabase.from("notifications").insert([
            {
                user_id: userId,
                title,
                message,
                order_id: orderId,
                is_read: false,
            },
        ]);

        if (error) {
            if (__DEV__) {
                console.log("Notification error:", error);
            }
        }
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async () => {
        if (!form.full_name || !form.phone || !form.city || !form.address) {
            Alert.alert("Missing Info", "Please fill required fields");
            return;
        }

        setLoading(true);

        try {
            // 1. Get user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                Alert.alert("Error", "You are not logged in");
                return;
            }

            // 2. Build order items (UNCHANGED LOGIC)
            const orderItems: any[] = [];

            parsed.variants.forEach((variant) => {
                const sizesMap = parsed.selectedQty?.[variant.id] || {};

                Object.entries(sizesMap).forEach(([sizeId, qty]) => {
                    if (!qty || qty <= 0) return;

                    orderItems.push({
                        variant_id: variant.id,
                        size_id: sizeId,
                        quantity: qty,
                        product_name_snapshot: parsed.product.name,
                        price_snapshot: parsed.product.price,
                    });
                });
            });

            // 3. Call SUPABASE FUNCTION (NEW)
            const { data: orderId, error } = await supabase.rpc("place_order", {
                p_user_id: user.id,
                p_full_name: form.full_name,
                p_phone: form.phone,
                p_email: form.email || null,
                p_city: form.city,
                p_address: form.address,
                p_product_id: parsed.product.id,
                p_items: orderItems,
            });

            if (error) throw error;

            /* ================= NOTIFICATIONS (UNCHANGED) ================= */

            const { data: productData } = await supabase
                .from("products")
                .select("seller_id")
                .eq("id", parsed.product.id)
                .single();

            const sellerId = productData?.seller_id;

            if (sellerId) {
                await sendNotification(
                    sellerId,
                    "New Order Received",
                    `${form.full_name} placed an order`,
                    orderId
                );
            }

            await sendNotification(
                user.id,
                "Order Confirmed",
                `Your order for ${parsed.product.name} has been placed`,
                orderId
            );

            Alert.alert("Success", "Order placed successfully");
            router.replace("/");

        } catch (err: any) {
            if (__DEV__) {
                console.log(err);
            }
            Alert.alert(
                "Error",
                err.message || "Failed to place order"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ================= UI ================= */

    return (
        <View style={{ flex: 1 }}>

            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image
                        source={require("@/assets/images/icons/chevron-right.png")}
                        style={styles.backIcon}
                    />
                </Pressable>

                <Text style={styles.headerTitle}>Checkout</Text>

                <View style={{ width: 30 }} />
            </View>

            <ScrollView style={{ padding: 15 }}>

                {/* PRODUCT */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600" }}>
                        {parsed.product.name}
                    </Text>

                    <Text style={{ color: "#666" }}>
                        Price: BDT {parsed.product.price} / Piece
                    </Text>
                </View>

                {/* FORM */}
                <TextInput
                    placeholder="Full Name *"
                    value={form.full_name}
                    onChangeText={(v) => handleChange("full_name", v)}
                    style={input}
                />

                <TextInput
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChangeText={(v) => handleChange("phone", v)}
                    style={input}
                    keyboardType="phone-pad"
                />

                <TextInput
                    placeholder="Email (optional)"
                    value={form.email}
                    onChangeText={(v) => handleChange("email", v)}
                    style={input}
                />

                <TextInput
                    placeholder="City *"
                    value={form.city}
                    onChangeText={(v) => handleChange("city", v)}
                    style={input}
                />

                <TextInput
                    placeholder="Delivery Address *"
                    value={form.address}
                    onChangeText={(v) => handleChange("address", v)}
                    style={[input, { height: 80 }]}
                    multiline
                />

                {/* ORDER SUMMARY */}
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: "600", marginBottom: 10 }}>
                        Order Items
                    </Text>

                    {parsed.variants.map((variant) => {
                        const sizesMap = parsed.selectedQty?.[variant.id] || {};
                        const variantSizes = parsed.sizes.filter(
                            (s) => s.variant_id === variant.id
                        );

                        return (
                            <View key={variant.id} style={card}>
                                <Text style={{ fontWeight: "600" }}>
                                    Color: {variant.color}
                                </Text>

                                {Object.entries(sizesMap).map(([sizeId, qty]) => {
                                    if (!qty || qty <= 0) return null;

                                    const sizeInfo = variantSizes.find(
                                        (s) => s.id === sizeId
                                    );

                                    return (
                                        <Text key={sizeId}>
                                            {sizeInfo?.size || "Unknown"} × {qty}
                                        </Text>
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>

                {/* BUTTON */}
                <Pressable style={btn} onPress={handleSubmit}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                            Confirm Order
                        </Text>
                    )}
                </Pressable>

            </ScrollView>
        </View>
    );
};

/* ================= STYLES ================= */

const input = {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
};

const btn = {
    backgroundColor: "#f5832b",
    padding: 15,
    borderRadius: 10,
    alignItems: "center" as const,
    marginTop: 20,
};

const card = {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
};

export default Checkout;