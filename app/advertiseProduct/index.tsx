import ConfirmModal from "@/components/modal/ConfirmModal";
import {
  AD_DURATION_DAYS,
  AD_PACKAGES,
  AdPackage,
  ProductAdRequest,
  SellerProductForAd,
  fetchMyLatestProductAdRequest,
  fetchSellerProductsForAds,
  submitProductAdRequest,
} from "@/lib/productAdRequests";
import { supabase } from "@/lib/supabase";
import { styles } from "@/styles/support";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

function mainImageUri(product: {
  product_images?: { image_url: string; is_main: boolean }[];
}): string | null {
  return (
    product.product_images?.find((img) => img.is_main)?.image_url ??
    product.product_images?.[0]?.image_url ??
    null
  );
}

const AdvertiseProduct = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isWholesale, setIsWholesale] = useState(false);
  const [products, setProducts] = useState<SellerProductForAd[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<AdPackage>(
    AD_PACKAGES[0]
  );
  const [latestRequest, setLatestRequest] =
    useState<ProductAdRequest | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadState = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("store_type")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const wholesale = profile?.store_type === "wholesale";
      setIsWholesale(wholesale);

      if (!wholesale) {
        setLatestRequest(null);
        setProducts([]);
        return;
      }

      const [request, sellerProducts] = await Promise.all([
        fetchMyLatestProductAdRequest(user.id),
        fetchSellerProductsForAds(user.id),
      ]);

      setLatestRequest(request);
      setProducts(sellerProducts);
    } catch (err: any) {
      if (__DEV__) {
        console.warn("[AdvertiseProduct] load failed:", err);
      }
      Alert.alert(
        "সমস্যা",
        err?.message || "অ্যাডভারটাইজ স্ট্যাটাস লোড করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const toggleProduct = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setSelectedIds([]);
    setSelectedPackage(AD_PACKAGES[0]);
    loadState();
  };

  const handleSubmit = async () => {
    if (!selectedIds.length) {
      Alert.alert(
        "প্রোডাক্ট বাছুন",
        "অ্যাডভারটাইজ করার জন্য কমপক্ষে একটি প্রোডাক্ট সিলেক্ট করুন।"
      );
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      await submitProductAdRequest({
        sellerId: user.id,
        productIds: selectedIds,
        sellTargetBdt: selectedPackage.sellTargetBdt,
        budgetBdt: selectedPackage.budgetBdt,
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      if (__DEV__) {
        console.warn("[AdvertiseProduct] submit failed:", err);
      }

      if (err?.code === "23505") {
        Alert.alert(
          "অনুরোধ অপেক্ষমাণ",
          "আপনার ইতিমধ্যে একটি পেন্ডিং অ্যাডভারটাইজ অনুরোধ আছে।"
        );
        loadState();
        return;
      }

      Alert.alert(
        "সমস্যা",
        err?.message || "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pending = latestRequest?.status === "pending";
  const canSubmit =
    isWholesale &&
    !pending &&
    products.length > 0 &&
    selectedIds.length > 0 &&
    !submitting &&
    !loading;

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("@/assets/images/icons/chevron-right.png")}
            style={styles.backIcon}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Advertise Product</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={local.center}>
          <ActivityIndicator size="large" color="#f5832b" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>আপনার প্রোডাক্ট অ্যাডভারটাইজ করুন</Text>
          <Text style={styles.paragraph}>
            প্রোডাক্ট সিলেক্ট করুন এবং {AD_DURATION_DAYS} দিনের একটি প্যাকেজ
            বেছে নিন। আমাদের টিম অনুরোধ রিভিউ করে ফোন করে নিশ্চিত করবে, তারপর
            ম্যানুয়ালি অ্যাড চালু করবে।
          </Text>

          <View style={local.pricingCard}>
            <Text style={local.statusTitle}>
              মূল্য তালিকা ({AD_DURATION_DAYS} দিন)
            </Text>
            <Text style={local.statusBody}>
              সেল টার্গেট ও মিলিয়ে অ্যাডভারটাইজ বাজেট বেছে নিন:
            </Text>
            {AD_PACKAGES.map((pkg) => (
              <View key={pkg.budgetBdt} style={local.pricingRow}>
                <Text style={local.pricingDuration}>
                  টার্গেট {formatBdt(pkg.sellTargetBdt)}
                </Text>
                <Text style={local.pricingAmount}>
                  বাজেট {formatBdt(pkg.budgetBdt)}
                </Text>
              </View>
            ))}
          </View>

          {!isWholesale ? (
            <View style={local.statusCard}>
              <Text style={local.statusTitle}>শুধুমাত্র সেলারদের জন্য</Text>
              <Text style={local.statusBody}>
                প্রোডাক্ট অ্যাডভারটাইজ শুধুমাত্র হোলসেল সেলার অ্যাকাউন্টের জন্য
                উপলব্ধ।
              </Text>
            </View>
          ) : pending ? (
            <View style={local.statusCard}>
              <Text style={local.statusTitle}>অনুরোধ অপেক্ষমাণ</Text>
              <Text style={local.statusBody}>
                আপনি
                {latestRequest?.created_at
                  ? ` ${new Date(latestRequest.created_at).toLocaleDateString("bn-BD")} তারিখে`
                  : ""}{" "}
                একটি অনুরোধ জমা দিয়েছেন। আমরা রিভিউ করে ফোন করে নিশ্চিত করব।
              </Text>
              {latestRequest ? (
                <Text style={local.priorMessage}>
                  প্যাকেজ: টার্গেট {formatBdt(latestRequest.sell_target_bdt)} ·
                  বাজেট {formatBdt(latestRequest.budget_bdt)} ·{" "}
                  {latestRequest.duration_days} দিন
                </Text>
              ) : null}
              {(latestRequest?.product_ad_request_items?.length ?? 0) > 0 ? (
                <View style={local.submittedProducts}>
                  {latestRequest!.product_ad_request_items!.map((item) => {
                    const name = item.products?.name ?? "Product";
                    const uri = item.products
                      ? mainImageUri(item.products)
                      : null;
                    return (
                      <View key={item.product_id} style={local.submittedRow}>
                        <Image
                          source={
                            uri
                              ? { uri }
                              : require("@/assets/images/product1.png")
                          }
                          style={local.submittedThumb}
                        />
                        <Text style={local.submittedName} numberOfLines={2}>
                          {name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : (
            <>
              {latestRequest?.status === "rejected" ? (
                <View style={[local.statusCard, local.statusCardWarn]}>
                  <Text style={local.statusTitle}>আগের অনুরোধ প্রত্যাখ্যাত</Text>
                  <Text style={local.statusBody}>
                    নিচে নতুন করে আবার অনুরোধ জমা দিতে পারবেন।
                  </Text>
                </View>
              ) : null}

              {latestRequest?.status === "approved" ? (
                <View style={local.statusCard}>
                  <Text style={local.statusTitle}>আগের অনুরোধ অনুমোদিত</Text>
                  <Text style={local.statusBody}>
                    চাইলে নিচে আরেকটি অ্যাডভারটাইজ অনুরোধ জমা দিতে পারবেন।
                  </Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>প্রোডাক্ট সিলেক্ট করুন</Text>
              {products.length === 0 ? (
                <View style={local.statusCard}>
                  <Text style={local.statusTitle}>কোনো অ্যাক্টিভ প্রোডাক্ট নেই</Text>
                  <Text style={local.statusBody}>
                    অ্যাডভারটাইজ করার আগে প্রোডাক্ট আপলোড করে অ্যাক্টিভ করুন।
                  </Text>
                </View>
              ) : (
                products.map((product) => {
                  const selected = selectedIds.includes(product.id);
                  const uri = mainImageUri(product);
                  return (
                    <Pressable
                      key={product.id}
                      style={[
                        local.productRow,
                        selected && local.productRowSelected,
                      ]}
                      onPress={() => toggleProduct(product.id)}
                    >
                      <Image
                        source={
                          uri
                            ? { uri }
                            : require("@/assets/images/product1.png")
                        }
                        style={local.productImage}
                      />
                      <View style={local.productInfo}>
                        <Text style={local.productName} numberOfLines={2}>
                          {product.name}
                        </Text>
                        <Text style={local.productPrice}>
                          BDT {product.price}
                        </Text>
                      </View>
                      <View
                        style={[
                          local.checkbox,
                          selected && local.checkboxSelected,
                        ]}
                      >
                        {selected ? (
                          <Text style={local.checkmark}>✓</Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })
              )}

              {products.length > 0 ? (
                <>
                  <Text style={styles.inputLabel}>প্যাকেজ বেছে নিন</Text>
                  {AD_PACKAGES.map((pkg) => {
                    const active =
                      selectedPackage.sellTargetBdt === pkg.sellTargetBdt;
                    return (
                      <Pressable
                        key={pkg.budgetBdt}
                        style={[
                          local.packageRow,
                          active && local.packageRowSelected,
                        ]}
                        onPress={() => setSelectedPackage(pkg)}
                      >
                        <View
                          style={[
                            local.radioOuter,
                            active && local.radioOuterActive,
                          ]}
                        >
                          {active ? <View style={local.radioInner} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={local.packageTitle}>
                            টার্গেট {formatBdt(pkg.sellTargetBdt)}
                          </Text>
                          <Text style={local.packageSub}>
                            বাজেট {formatBdt(pkg.budgetBdt)} ·{" "}
                            {AD_DURATION_DAYS} দিন
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}

                  <Pressable
                    style={[
                      styles.submitBtn,
                      !canSubmit && styles.submitBtnDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                  >
                    <Text style={styles.submitBtnText}>
                      {submitting ? "Submitting..." : "Submit Request"}
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </>
          )}
        </ScrollView>
      )}

      <ConfirmModal
        visible={showSuccessModal}
        title="অনুরোধ জমা হয়েছে"
        description="ধন্যবাদ। আমাদের টিম রিভিউ করে ফোন করে নিশ্চিত করবে।"
        confirmText="OK"
        cancelText={null}
        onConfirm={handleSuccessClose}
      />
    </View>
  );
};

const local = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pricingCard: {
    marginTop: 20,
    backgroundColor: "#fff7ed",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  pricingRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pricingDuration: {
    fontSize: 14,
    color: "#444",
  },
  pricingAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  statusCardWarn: {
    marginBottom: 8,
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
  },
  statusBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#444",
  },
  priorMessage: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
    fontStyle: "italic",
  },
  submittedProducts: {
    marginTop: 12,
    gap: 8,
  },
  submittedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  submittedThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  submittedName: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  productRowSelected: {
    borderColor: "#f5832b",
    backgroundColor: "#fff7ed",
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  productInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  productPrice: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#f5832b",
    borderColor: "#f5832b",
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  packageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  packageRowSelected: {
    borderColor: "#111",
    backgroundColor: "#f9fafb",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: "#111",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111",
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  packageSub: {
    marginTop: 2,
    fontSize: 13,
    color: "#6b7280",
  },
});

export default AdvertiseProduct;
