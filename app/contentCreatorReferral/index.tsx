import ConfirmModal from "@/components/modal/ConfirmModal";
import { showAppAlert } from "@/context/AppAlertContext";
import {
  fetchMyLatestReferralCreatorApplication,
  ReferralCreatorApplication,
  ReferralCreatorPlatform,
  submitReferralCreatorApplication,
} from "@/lib/referralCreatorApplications";
import { supabase } from "@/lib/supabase";
import { styles } from "@/styles/support";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

const PLATFORMS: { value: ReferralCreatorPlatform; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "other", label: "অন্যান্য" },
];

const PLATFORM_LABEL: Record<ReferralCreatorPlatform, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  other: "অন্যান্য",
};

const ContentCreatorReferral = () => {
  const navigation = useNavigation();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [platform, setPlatform] = useState<ReferralCreatorPlatform | null>(
    null
  );
  const [profileUrl, setProfileUrl] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [latestApplication, setLatestApplication] =
    useState<ReferralCreatorApplication | null>(null);
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

      const [{ data: profile }, application] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single(),
        fetchMyLatestReferralCreatorApplication(user.id),
      ]);

      if (profile?.full_name) setFullName(profile.full_name);
      if (profile?.phone) setPhone(profile.phone);
      setLatestApplication(application);
    } catch (err: any) {
      if (__DEV__) {
        console.warn("[ContentCreatorReferral] load failed:", err);
      }
      showAppAlert(
        "সমস্যা",
        err?.message || "অ্যাপ্লিকেশনের স্ট্যাটাস লোড করা যায়নি। আবার চেষ্টা করুন।"
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
    setProfileUrl("");
    setFollowerCount("");
    setMessage("");
    setPlatform(null);
    loadState();
  };

  const handleSubmit = async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedUrl = profileUrl.trim();
    const trimmedFollowers = followerCount.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedPhone || !platform || !trimmedUrl) {
      showAppAlert(
        "তথ্য অসম্পূর্ণ",
        "অনুগ্রহ করে নাম, ফোন, প্ল্যাটফর্ম এবং প্রোফাইল লিংক পূরণ করুন।"
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

      await submitReferralCreatorApplication({
        userId: user.id,
        fullName: trimmedName,
        phone: trimmedPhone,
        platform,
        profileUrl: trimmedUrl,
        followerCount: trimmedFollowers || null,
        message: trimmedMessage || null,
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      if (__DEV__) {
        console.warn("[ContentCreatorReferral] submit failed:", err);
      }

      // Partial unique index on pending → Postgres 23505
      if (err?.code === "23505") {
        showAppAlert(
          "অনুরোধ অপেক্ষমাণ",
          "আপনার ইতিমধ্যে একটি পেন্ডিং আবেদন আছে। আমাদের টিম শীঘ্রই যোগাযোগ করবে।"
        );
        loadState();
        return;
      }

      showAppAlert(
        "সমস্যা",
        err?.message || "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pending = latestApplication?.status === "pending";
  const approved = latestApplication?.status === "approved";
  const canSubmit = !pending && !approved && !submitting && !loading;

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
        <Text style={styles.headerTitle}>Content Creator Referral</Text>
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
          <Text style={styles.sectionTitle}>কনটেন্ট ক্রিয়েটর রেফারেল প্রোগ্রাম</Text>
          <Text style={styles.paragraph}>
            আপনি যদি কনটেন্ট ক্রিয়েটর হন, এই প্রোগ্রামে আবেদন করতে পারেন। আবেদন
            জমা দিলে আমাদের টিম আপনার সাথে যোগাযোগ করে নিশ্চিত করবে। এরপর আপনাকে
            একটি কাস্টম রেফারেল আইডি দেওয়া হবে, যা দিয়ে নতুন ইউজার সাইন আপ করতে
            পারবে।
          </Text>

          <View style={local.infoCard}>
            <Text style={local.infoTitle}>কীভাবে কাজ করে?</Text>
            <Text style={local.infoStep}>১. নিচের ফর্ম পূরণ করে আবেদন জমা দিন</Text>
            <Text style={local.infoStep}>
              ২. আমাদের টিম ফোন বা মেসেজে আপনার সাথে যোগাযোগ করবে
            </Text>
            <Text style={local.infoStep}>
              ৩. নিশ্চিত হলে আপনাকে কাস্টম রেফারেল আইডি দেওয়া হবে
            </Text>
          </View>

          {approved ? (
            <View style={local.statusCard}>
              <Text style={local.statusTitle}>আবেদন অনুমোদিত</Text>
              <Text style={local.statusBody}>
                আপনার আবেদন অনুমোদন করা হয়েছে। রেফারেল আইডি পেতে আমাদের টিমের
                সাথে যোগাযোগ রাখুন (যদি এখনো না পেয়ে থাকেন)।
              </Text>
            </View>
          ) : pending ? (
            <View style={local.statusCard}>
              <Text style={local.statusTitle}>আবেদন অপেক্ষমাণ</Text>
              <Text style={local.statusBody}>
                আপনি
                {latestApplication?.created_at
                  ? ` ${new Date(latestApplication.created_at).toLocaleDateString("bn-BD")} তারিখে`
                  : ""}{" "}
                আবেদন জমা দিয়েছেন। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।
              </Text>
              {latestApplication ? (
                <Text style={local.priorMessage}>
                  প্ল্যাটফর্ম: {PLATFORM_LABEL[latestApplication.platform]}
                  {"\n"}
                  লিংক: {latestApplication.profile_url}
                </Text>
              ) : null}
            </View>
          ) : (
            <>
              {latestApplication?.status === "rejected" ? (
                <View style={[local.statusCard, local.statusCardWarn]}>
                  <Text style={local.statusTitle}>আগের আবেদন প্রত্যাখ্যাত</Text>
                  <Text style={local.statusBody}>
                    নিচে নতুন করে আবার আবেদন জমা দিতে পারবেন।
                  </Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>আপনার নাম</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="পুরো নাম লিখুন"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>মোবাইল নম্বর</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="01XXXXXXXXX"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>কোন প্ল্যাটফর্মে কনটেন্ট করেন?</Text>
              <View style={local.platformRow}>
                {PLATFORMS.map((item) => {
                  const selected = platform === item.value;
                  return (
                    <Pressable
                      key={item.value}
                      style={[
                        local.platformChip,
                        selected && local.platformChipSelected,
                      ]}
                      onPress={() => setPlatform(item.value)}
                    >
                      <Text
                        style={[
                          local.platformChipText,
                          selected && local.platformChipTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>প্রোফাইল / পেজ লিংক</Text>
              <TextInput
                value={profileUrl}
                onChangeText={setProfileUrl}
                placeholder="যেমন: facebook.com/yourpage"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.inputLabel}>ফলোয়ার সংখ্যা (ঐচ্ছিক)</Text>
              <TextInput
                value={followerCount}
                onChangeText={setFollowerCount}
                placeholder="যেমন: ৫০০০ বা ১০ হাজার"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>কিছু বলতে চান? (ঐচ্ছিক)</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="আপনার কনটেন্ট বা অডিয়েন্স সম্পর্কে সংক্ষেপে লিখুন..."
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
                  {submitting ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      )}

      <ConfirmModal
        visible={showSuccessModal}
        title="আবেদন জমা হয়েছে"
        description="ধন্যবাদ। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করে নিশ্চিত করবে। এরপর আপনাকে কাস্টম রেফারেল আইডি দেওয়া হবে।"
        confirmText="ঠিক আছে"
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
  infoCard: {
    marginTop: 20,
    backgroundColor: "#fff7ed",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 10,
  },
  infoStep: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
    marginBottom: 4,
  },
  statusCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
  },
  platformRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  platformChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  platformChipSelected: {
    borderColor: "#111",
    backgroundColor: "#111",
  },
  platformChipText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  platformChipTextSelected: {
    color: "#fff",
  },
});

export default ContentCreatorReferral;
