import DeliveryAddressFormFields, {
    AddressFormValues,
    emptyAddressForm,
} from "@/components/delivery/DeliveryAddressFormFields";
import { showAppAlert } from "@/context/AppAlertContext";
import { useUser } from "@/context/UserContext";
import { useProfile } from "@/hooks/useProfile";
import {
    createDeliveryAddress,
    DeliveryAddress,
    formatDeliveryAddressLine,
    listDeliveryAddresses,
    setDefaultDeliveryAddress,
    toOrderDeliverySnapshot,
} from "@/lib/deliveryAddresses";
import { placeOrder } from "@/lib/catalogApi";
import CourierLocationPickers from "@/components/delivery/CourierLocationPickers";
import {
    CourierLocation,
    CourierQuote,
    emptyCourierLocation,
    fetchCourierAvailable,
    fetchCourierQuote,
} from "@/lib/courier";
import { goToSignIn } from "@/lib/guestAuth";
import { supabase } from "@/lib/supabase";
import { styles } from "@/styles/profile";
import Checkbox from "expo-checkbox";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
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

type AddressMode = "store" | "saved" | "custom";

/* ================= COMPONENT ================= */

const Checkout = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const { user, loading: authLoading } = useUser();
    const { profile } = useProfile();

    const { data } = useLocalSearchParams<{ data: string }>();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            goToSignIn();
        }
    }, [authLoading, user]);

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
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
    const [addressMode, setAddressMode] = useState<AddressMode>("store");
    const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
    const [customForm, setCustomForm] =
        useState<AddressFormValues>(emptyAddressForm());
    const [saveCustomAddress, setSaveCustomAddress] = useState(true);
    const [setCustomAsDefault, setSetCustomAsDefault] = useState(false);
    const [defaultDeliveryAddressId, setDefaultDeliveryAddressId] = useState<
        string | null
    >(null);

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        email: "",
    });

    const [contactPrefillDone, setContactPrefillDone] = useState(false);

    /* Prefill contact + default delivery preference from profile */
    useEffect(() => {
        if (!profile || contactPrefillDone) return;

        setForm((prev) => ({
            full_name: prev.full_name || profile.full_name || "",
            phone: prev.phone || profile.phone || "",
            email: prev.email,
        }));

        const defaultId = (profile.default_delivery_address_id as
            | string
            | null
            | undefined) ?? null;

        setDefaultDeliveryAddressId(defaultId);

        if (defaultId) {
            setAddressMode("saved");
            setSelectedSavedId(defaultId);
        } else {
            setAddressMode("store");
        }

        setContactPrefillDone(true);
    }, [profile, contactPrefillDone]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!profile?.id) {
                setAddressesLoading(false);
                return;
            }
            setAddressesLoading(true);
            try {
                const rows = await listDeliveryAddresses(profile.id);
                if (cancelled) return;
                setSavedAddresses(rows);

                setSelectedSavedId((prev) => {
                    if (prev && rows.some((r) => r.id === prev)) return prev;
                    const defaultId = profile.default_delivery_address_id as
                        | string
                        | null
                        | undefined;
                    if (defaultId && rows.some((r) => r.id === defaultId)) {
                        return defaultId;
                    }
                    return rows[0]?.id ?? null;
                });
            } catch (e) {
                if (__DEV__) console.log(e);
            } finally {
                if (!cancelled) setAddressesLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [profile?.id, profile?.default_delivery_address_id]);

    /* ---------- Pathao courier (only when available for this product) ---------- */
    const productId = parsed?.product?.id;
    const totalQuantity = useMemo(() => {
        if (!parsed) return 0;
        let sum = 0;
        for (const sizes of Object.values(parsed.selectedQty ?? {})) {
            for (const qty of Object.values(sizes ?? {})) sum += Number(qty) || 0;
        }
        return sum;
    }, [parsed]);
    const [courierEnabled, setCourierEnabled] = useState(false);
    const [courierLocation, setCourierLocation] =
        useState<CourierLocation>(emptyCourierLocation());
    const [quoteResult, setQuoteResult] = useState<{
        key: string;
        quote: CourierQuote;
    } | null>(null);
    const [quoteNonce, setQuoteNonce] = useState(0);
    const { city_id: qCity, zone_id: qZone, area_id: qArea } = courierLocation;

    useEffect(() => {
        if (!productId) return;
        void fetchCourierAvailable(productId).then(setCourierEnabled);
    }, [productId]);

    const quoteKey =
        courierEnabled && productId && totalQuantity && qCity && qZone
            ? `${productId}|${totalQuantity}|${qCity}|${qZone}|${qArea ?? ""}|${quoteNonce}`
            : null;

    useEffect(() => {
        if (!quoteKey || !productId || !qCity || !qZone) return;
        let cancelled = false;
        fetchCourierQuote({
            product_id: productId,
            quantity: totalQuantity,
            city_id: qCity,
            zone_id: qZone,
            area_id: qArea,
        })
            .then((quote) => {
                if (!cancelled) setQuoteResult({ key: quoteKey, quote });
            })
            .catch((err: any) => {
                if (cancelled) return;
                setQuoteResult({
                    key: quoteKey,
                    quote: {
                        available: false,
                        reason: "error",
                        message: err?.message || "ডেলিভারি চার্জ হিসাব করা যায়নি।",
                    },
                });
            });
        return () => {
            cancelled = true;
        };
    }, [quoteKey, productId, totalQuantity, qCity, qZone, qArea]);

    const courierQuote =
        quoteResult && quoteResult.key === quoteKey ? quoteResult.quote : null;
    const quoting = quoteKey !== null && courierQuote === null;
    // Seller not ready etc. → order proceeds as before (seller arranges delivery).
    const courierUnavailableForProduct =
        courierQuote !== null && !courierQuote.available && courierQuote.reason !== "error";
    const useCourier = courierEnabled && !courierUnavailableForProduct;
    const courierFee = courierQuote?.available ? courierQuote.delivery_fee : 0;

    if (authLoading || !user) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#f5832b" />
            </View>
        );
    }

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

    const storeSnapshot = useMemo(() => {
        if (!profile?.district || !profile?.address) return null;
        return toOrderDeliverySnapshot({
            district: profile.district,
            upazila: profile.upazila,
            address: profile.address,
        });
    }, [profile?.district, profile?.upazila, profile?.address]);

    const resolveDeliverySnapshot = (): {
        city: string;
        delivery_address: string;
    } | null => {
        if (addressMode === "store") {
            return storeSnapshot;
        }

        if (addressMode === "saved") {
            const selected = savedAddresses.find((a) => a.id === selectedSavedId);
            if (!selected) return null;
            return toOrderDeliverySnapshot(selected);
        }

        if (!customForm.district.trim() || !customForm.address.trim()) {
            return null;
        }
        return toOrderDeliverySnapshot(customForm);
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async () => {
        if (!form.full_name || !form.phone) {
            showAppAlert("তথ্য অসম্পূর্ণ", "যোগাযোগের প্রয়োজনীয় তথ্য পূরণ করুন।");
            return;
        }

        const delivery = resolveDeliverySnapshot();
        if (!delivery) {
            if (addressMode === "store") {
                showAppAlert(
                    "দোকানের ঠিকানা নেই",
                    "আপনার প্রোফাইলে দোকানের ঠিকানা সম্পূর্ণ নয়।"
                );
            } else if (addressMode === "saved") {
                showAppAlert(
                    "ঠিকানা সিলেক্ট করুন",
                    "ডেলিভারির জন্য একটি সংরক্ষিত ঠিকানা বেছে নিন।"
                );
            } else {
                showAppAlert(
                    "তথ্য অসম্পূর্ণ",
                    "জেলা ও ঠিকানা পূরণ করুন।"
                );
            }
            return;
        }

        let courierDelivery:
            | {
                  method: "pathao";
                  city_id: number;
                  zone_id: number;
                  area_id: number | null;
                  expected_fee: number;
              }
            | undefined;
        if (useCourier) {
            if (!courierLocation.city_id || !courierLocation.zone_id) {
                showAppAlert("ঠিকানা অসম্পূর্ণ", "হোম ডেলিভারির জন্য শহর ও জোন বাছাই করুন।");
                return;
            }
            if (!courierQuote?.available) {
                showAppAlert(
                    "অপেক্ষা করুন",
                    quoting
                        ? "ডেলিভারি চার্জ হিসাব হচ্ছে।"
                        : "ডেলিভারি চার্জ পাওয়া যায়নি। আবার চেষ্টা করুন।"
                );
                if (!quoting) setQuoteNonce((n) => n + 1);
                return;
            }
            courierDelivery = {
                method: "pathao",
                city_id: courierLocation.city_id,
                zone_id: courierLocation.zone_id,
                area_id: courierLocation.area_id,
                expected_fee: courierQuote.delivery_fee,
            };
        }

        setLoading(true);

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                showAppAlert("সাইন ইন প্রয়োজন", "অর্ডার করতে আগে সাইন ইন করুন।");
                return;
            }

            // Optionally persist custom address before placing order
            if (addressMode === "custom" && saveCustomAddress) {
                const created = await createDeliveryAddress(user.id, customForm);
                setSavedAddresses((prev) => [created, ...prev]);
                if (setCustomAsDefault) {
                    await setDefaultDeliveryAddress(user.id, created.id);
                    setDefaultDeliveryAddressId(created.id);
                }
            }

            const orderItems: any[] = [];

            parsed.variants.forEach((variant) => {
                const sizesMap = parsed.selectedQty?.[variant.id] || {};

                Object.entries(sizesMap).forEach(([sizeId, qty]) => {
                    if (!qty || qty <= 0) return;

                    orderItems.push({
                        variant_id: variant.id,
                        size_id: sizeId,
                        quantity: qty,
                    });
                });
            });

            await placeOrder({
                full_name: form.full_name,
                phone: form.phone,
                email: form.email || null,
                city: delivery.city,
                address: delivery.delivery_address,
                product_id: parsed.product.id,
                items: orderItems,
                ...(courierDelivery ? { delivery: courierDelivery } : {}),
            });

            showAppAlert("সফল", "আপনার অর্ডার সফলভাবে প্লেস হয়েছে।");
            router.replace("/");
        } catch (err: any) {
            if (__DEV__) {
                console.log(err);
            }
            // Fee changed between quote and order → refresh so the buyer sees the new total.
            if (err?.code === "DELIVERY_FEE_CHANGED") setQuoteNonce((n) => n + 1);
            showAppAlert("সমস্যা", err.message || "অর্ডার প্লেস করা যায়নি।");
        } finally {
            setLoading(false);
        }
    };

    const OptionChip = ({
        mode,
        label,
    }: {
        mode: AddressMode;
        label: string;
    }) => {
        const active = addressMode === mode;
        return (
            <Pressable
                onPress={() => setAddressMode(mode)}
                style={[ui.chip, active && ui.chipActive]}
            >
                <Text style={[ui.chipText, active && ui.chipTextActive]}>
                    {label}
                </Text>
            </Pressable>
        );
    };

    /* ================= UI ================= */

    return (
        <View style={{ flex: 1 }}>
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

            <ScrollView
                style={{ padding: 15 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600" }}>
                        {parsed.product.name}
                    </Text>

                    <Text style={{ color: "#666" }}>
                        Price: BDT {parsed.product.price} / Piece
                    </Text>
                </View>

                <Text style={ui.sectionLabel}>Contact</Text>

                <TextInput
                    placeholder="Full Name *"
                    placeholderTextColor="#9CA3AF"
                    value={form.full_name}
                    onChangeText={(v) => handleChange("full_name", v)}
                    style={ui.input}
                />

                <TextInput
                    placeholder="Phone Number *"
                    placeholderTextColor="#9CA3AF"
                    value={form.phone}
                    onChangeText={(v) => handleChange("phone", v)}
                    style={ui.input}
                    keyboardType="phone-pad"
                />

                <TextInput
                    placeholder="Email (optional)"
                    placeholderTextColor="#9CA3AF"
                    value={form.email}
                    onChangeText={(v) => handleChange("email", v)}
                    style={ui.input}
                />

                <Text style={[ui.sectionLabel, { marginTop: 8 }]}>
                    Delivery address
                </Text>

                <View style={ui.chipRow}>
                    <OptionChip mode="store" label="Store" />
                    <OptionChip mode="saved" label="Saved" />
                    <OptionChip mode="custom" label="New" />
                </View>

                {addressMode === "store" ? (
                    <View style={ui.addressCard}>
                        {storeSnapshot ? (
                            <>
                                <Text style={ui.addressTitle}>
                                    Deliver to store address
                                </Text>
                                <Text style={ui.addressBody}>
                                    {formatDeliveryAddressLine({
                                        district: profile?.district,
                                        upazila: profile?.upazila,
                                        address: profile?.address,
                                    })}
                                </Text>
                                {defaultDeliveryAddressId ? (
                                    <Pressable
                                        style={ui.inlineLink}
                                        onPress={async () => {
                                            if (!profile?.id) return;
                                            try {
                                                await setDefaultDeliveryAddress(
                                                    profile.id,
                                                    null
                                                );
                                                setDefaultDeliveryAddressId(null);
                                                showAppAlert(
                                                    "সংরক্ষিত",
                                                    "দোকানের ঠিকানা এখন ডিফল্ট ডেলিভারি ঠিকানা।"
                                                );
                                            } catch (e: any) {
                                                showAppAlert(
                                                    "সমস্যা",
                                                    e?.message ||
                                                        "ডিফল্ট ঠিকানা আপডেট করা যায়নি।"
                                                );
                                            }
                                        }}
                                    >
                                        <Text style={ui.inlineLinkText}>
                                            Set store address as default
                                        </Text>
                                    </Pressable>
                                ) : (
                                    <Text style={[ui.defaultTag, { marginTop: 8 }]}>
                                        Your default delivery address
                                    </Text>
                                )}
                            </>
                        ) : (
                            <Text style={ui.addressBody}>
                                Your store address is incomplete. Use a saved or
                                new address instead.
                            </Text>
                        )}
                    </View>
                ) : null}

                {addressMode === "saved" ? (
                    <View>
                        {addressesLoading ? (
                            <ActivityIndicator style={{ marginVertical: 12 }} />
                        ) : savedAddresses.length === 0 ? (
                            <View style={ui.addressCard}>
                                <Text style={ui.addressBody}>
                                    No saved delivery addresses yet. Switch to
                                    “New” to add one.
                                </Text>
                                <Pressable
                                    style={ui.inlineLink}
                                    onPress={() => setAddressMode("custom")}
                                >
                                    <Text style={ui.inlineLinkText}>
                                        Create a new address
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            savedAddresses.map((addr) => {
                                const selected = selectedSavedId === addr.id;
                                const isDefault =
                                    defaultDeliveryAddressId === addr.id;
                                return (
                                    <Pressable
                                        key={addr.id}
                                        onPress={() =>
                                            setSelectedSavedId(addr.id)
                                        }
                                        style={[
                                            ui.addressCard,
                                            selected && ui.addressCardSelected,
                                        ]}
                                    >
                                        <View style={ui.addressHead}>
                                            <Text style={ui.addressTitle}>
                                                {addr.label?.trim() ||
                                                    "Saved address"}
                                            </Text>
                                            {isDefault ? (
                                                <Text style={ui.defaultTag}>
                                                    Default
                                                </Text>
                                            ) : null}
                                        </View>
                                        <Text style={ui.addressBody}>
                                            {formatDeliveryAddressLine(addr)}
                                        </Text>
                                        {selected && !isDefault ? (
                                            <Pressable
                                                style={ui.inlineLink}
                                                onPress={async () => {
                                                    if (!profile?.id) return;
                                                    try {
                                                        await setDefaultDeliveryAddress(
                                                            profile.id,
                                                            addr.id
                                                        );
                                                        setDefaultDeliveryAddressId(
                                                            addr.id
                                                        );
                                                    } catch (e: any) {
                                                        showAppAlert(
                                                            "সমস্যা",
                                                            e?.message ||
                                                                "ডিফল্ট ঠিকানা আপডেট করা যায়নি।"
                                                        );
                                                    }
                                                }}
                                            >
                                                <Text style={ui.inlineLinkText}>
                                                    Set as default
                                                </Text>
                                            </Pressable>
                                        ) : null}
                                    </Pressable>
                                );
                            })
                        )}
                    </View>
                ) : null}

                {addressMode === "custom" ? (
                    <View style={ui.addressCard}>
                        <Text style={[ui.addressTitle, { marginBottom: 8 }]}>
                            New delivery address
                        </Text>
                        <DeliveryAddressFormFields
                            values={customForm}
                            onChange={setCustomForm}
                        />

                        <Pressable
                            style={ui.checkRow}
                            onPress={() =>
                                setSaveCustomAddress((v) => !v)
                            }
                        >
                            <Checkbox
                                value={saveCustomAddress}
                                onValueChange={setSaveCustomAddress}
                                color={saveCustomAddress ? "#f5832b" : undefined}
                            />
                            <Text style={ui.checkLabel}>
                                Save this address for next time
                            </Text>
                        </Pressable>

                        {saveCustomAddress ? (
                            <Pressable
                                style={ui.checkRow}
                                onPress={() =>
                                    setSetCustomAsDefault((v) => !v)
                                }
                            >
                                <Checkbox
                                    value={setCustomAsDefault}
                                    onValueChange={setSetCustomAsDefault}
                                    color={
                                        setCustomAsDefault
                                            ? "#f5832b"
                                            : undefined
                                    }
                                />
                                <Text style={ui.checkLabel}>
                                    Set as my default delivery address
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                ) : null}

                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: "600", marginBottom: 10 }}>
                        Order Items
                    </Text>

                    {parsed.variants.map((variant) => {
                        const sizesMap =
                            parsed.selectedQty?.[variant.id] || {};
                        const variantSizes = parsed.sizes.filter(
                            (s) => s.variant_id === variant.id
                        );

                        return (
                            <View key={variant.id} style={ui.card}>
                                <Text style={{ fontWeight: "600" }}>
                                    Color: {variant.color}
                                </Text>

                                {Object.entries(sizesMap).map(
                                    ([sizeId, qty]) => {
                                        if (!qty || qty <= 0) return null;

                                        const sizeInfo = variantSizes.find(
                                            (s) => s.id === sizeId
                                        );

                                        return (
                                            <Text key={sizeId}>
                                                {sizeInfo?.size || "Unknown"} ×{" "}
                                                {qty}
                                            </Text>
                                        );
                                    }
                                )}
                            </View>
                        );
                    })}
                </View>

                {courierEnabled ? (
                    <View style={[ui.addressCard, { marginBottom: 16 }]}>
                        <Text style={ui.addressTitle}>হোম ডেলিভারি (Pathao)</Text>
                        <Text style={[ui.addressBody, { marginBottom: 10 }]}>
                            ডেলিভারি চার্জ জানতে শহর, জোন ও এরিয়া বাছাই করুন। পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন।
                        </Text>
                        <CourierLocationPickers
                            value={courierLocation}
                            onChange={setCourierLocation}
                        />
                        {quoting ? (
                            <ActivityIndicator style={{ marginTop: 6 }} />
                        ) : courierQuote?.available ? (
                            <Text style={{ fontWeight: "600", marginTop: 4 }}>
                                ডেলিভারি চার্জ: ৳{courierQuote.delivery_fee}
                            </Text>
                        ) : courierQuote ? (
                            <Text style={{ color: "#8A4B00", marginTop: 4 }}>
                                {courierUnavailableForProduct
                                    ? `${courierQuote.message} (বিক্রেতা নিজে ডেলিভারির ব্যবস্থা করবেন)`
                                    : courierQuote.message}
                            </Text>
                        ) : null}
                        {useCourier && courierQuote?.available ? (
                            <Text style={{ color: "#666", marginTop: 4 }}>
                                মোট পরিশোধ: ৳
                                {Math.round(
                                    Number(parsed.product.price) * totalQuantity + courierFee
                                )}{" "}
                                (ক্যাশ অন ডেলিভারি)
                            </Text>
                        ) : null}
                    </View>
                ) : null}

                <Pressable style={ui.btn} onPress={handleSubmit}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                            Confirm Order
                        </Text>
                    )}
                </Pressable>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

/* ================= STYLES ================= */

const ui = StyleSheet.create({
    sectionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        color: "#000000",
        backgroundColor: "#ffffff",
    },
    chipRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#f9fafb",
        alignItems: "center",
    },
    chipActive: {
        backgroundColor: "#111827",
        borderColor: "#111827",
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6b7280",
    },
    chipTextActive: {
        color: "#ffffff",
    },
    addressCard: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        backgroundColor: "#fff",
    },
    addressCardSelected: {
        borderColor: "#f5832b",
        backgroundColor: "#fff7ed",
    },
    addressHead: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 4,
    },
    addressTitle: {
        fontWeight: "600",
        color: "#111827",
        flex: 1,
    },
    addressBody: {
        fontSize: 13,
        color: "#4b5563",
        lineHeight: 19,
    },
    defaultTag: {
        fontSize: 11,
        fontWeight: "600",
        color: "#f5832b",
    },
    inlineLink: {
        marginTop: 10,
    },
    inlineLinkText: {
        color: "#f5832b",
        fontWeight: "600",
    },
    checkRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 8,
    },
    checkLabel: {
        flex: 1,
        fontSize: 13,
        color: "#374151",
    },
    btn: {
        backgroundColor: "#f5832b",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    card: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
});

export default Checkout;
