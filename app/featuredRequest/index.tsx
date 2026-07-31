import ConfirmModal from "@/components/modal/ConfirmModal";
import {
  FeaturedStoreRequest,
  fetchMyLatestFeaturedRequest,
  isSellerCurrentlyFeatured,
  submitFeaturedStoreRequest,
} from "@/lib/featuredStoreRequests";
import { supabase } from "@/lib/supabase";
import { styles } from "@/styles/support";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const FeaturedRequest = () => {
  const navigation = useNavigation();

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWholesale, setIsWholesale] = useState(false);
  const [alreadyFeatured, setAlreadyFeatured] = useState(false);
  const [latestRequest, setLatestRequest] =
    useState<FeaturedStoreRequest | null>(null);
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
        setAlreadyFeatured(false);
        return;
      }

      const [featured, request] = await Promise.all([
        isSellerCurrentlyFeatured(user.id),
        fetchMyLatestFeaturedRequest(user.id),
      ]);

      setAlreadyFeatured(featured);
      setLatestRequest(request);
    } catch (err: any) {
      if (__DEV__) {
        console.warn("[FeaturedRequest] load failed:", err);
      }
      Alert.alert(
        "সমস্যা",
        err?.message || "অনুরোধের স্ট্যাটাস লোড করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setMessage("");
    loadState();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      await submitFeaturedStoreRequest(
        user.id,
        message.trim() ? message.trim() : null
      );

      setShowSuccessModal(true);
    } catch (err: any) {
      if (__DEV__) {
        console.warn("[FeaturedRequest] submit failed:", err);
      }

      // Partial unique index on pending → Postgres 23505
      if (err?.code === "23505") {
        Alert.alert(
          "অনুরোধ অপেক্ষমাণ",
          "আপনার ইতিমধ্যে একটি পেন্ডিং ফিচারড স্টোর অনুরোধ আছে।"
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
    isWholesale && !alreadyFeatured && !pending && !submitting && !loading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("@/assets/images/icons/chevron-right.png")}
            style={styles.backIcon}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Featured Store</Text>
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
          <Text style={styles.sectionTitle}>ফিচারড স্টোর পান</Text>
          <Text style={styles.paragraph}>
            হোম স্ক্রিনের Featured Stores সেকশনে আপনার স্টোর দেখানোর জন্য অনুরোধ
            করুন। আমাদের টিম রিভিউ করে অনুমোদন দিলে স্টোর ফিচার হবে।
          </Text>

          <View style={local.pricingCard}>
            <Text style={local.statusTitle}>মূল্য তালিকা</Text>
            <Text style={local.statusBody}>
              ফিচারড স্টোর একটি পেইড প্রমোশন। আমাদের টিম আপনার সাথে যোগাযোগ
              করলে সময়কাল বেছে নিতে পারবেন:
            </Text>
            <View style={local.pricingRow}>
              <Text style={local.pricingDuration}>৭ দিন</Text>
              <Text style={local.pricingAmount}>১,০০০ টাকা</Text>
            </View>
            <View style={local.pricingRow}>
              <Text style={local.pricingDuration}>১০ দিন</Text>
              <Text style={local.pricingAmount}>১,২০০ টাকা</Text>
            </View>
          </View>

          {!isWholesale ? (
            <View style={local.statusCard}>
              <Text style={local.statusTitle}>শুধুমাত্র সেলারদের জন্য</Text>
              <Text style={local.statusBody}>
                ফিচারড স্টোর অনুরোধ শুধুমাত্র হোলসেল সেলার অ্যাকাউন্টের জন্য
                উপলব্ধ।
              </Text>
            </View>
          ) : alreadyFeatured ? (
            <View style={local.statusCard}>
              <Text style={local.statusTitle}>ইতিমধ্যে ফিচারড আছে</Text>
              <Text style={local.statusBody}>
                আপনার স্টোর এখন Featured Stores-এ দেখানো হচ্ছে। এই সময়কাল শেষ
                হলে আবার অনুরোধ করতে পারবেন।
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
                ইতিমধ্যে একটি অনুরোধ জমা দিয়েছেন। শীঘ্রই রিভিউ করা হবে।
              </Text>
              {latestRequest?.message ? (
                <Text style={local.priorMessage}>
                  আপনার মেসেজ: {latestRequest.message}
                </Text>
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

              <Text style={styles.inputLabel}>মেসেজ (ঐচ্ছিক)</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="কেন আপনার স্টোর ফিচার হওয়া উচিত, সংক্ষেপে লিখুন..."
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

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
          )}
        </ScrollView>
      )}

      <ConfirmModal
        visible={showSuccessModal}
        title="অনুরোধ জমা হয়েছে"
        description="ধন্যবাদ। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।"
        confirmText="OK"
        cancelText={null}
        onConfirm={handleSuccessClose}
      />
    </KeyboardAvoidingView>
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
});

export default FeaturedRequest;
