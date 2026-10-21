import { useProfile } from "@/hooks/useProfile";
import { goToSignIn } from "@/lib/guestAuth";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRIMARY = "#f5832b";

export default function HubTab() {
  const { profile, loading: profileLoading } = useProfile();
  const isWholesale = profile?.store_type === "wholesale";

  if (profileLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>সাইন ইন প্রয়োজন</Text>
        <Text style={styles.emptyBody}>এই তথ্য দেখতে লগ ইন করুন।</Text>
        <Pressable
          style={styles.signInBtn}
          onPress={() => goToSignIn("/(tabs)/hub")}
        >
          <Text style={styles.signInBtnText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return isWholesale ? <WholesaleHub /> : <RetailHub />;
}

/* ===================== WHOLESALE: SELLER GUIDE ===================== */

function WholesaleHub() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hub</Text>
        <Text style={styles.headerSub}>বিক্রেতা সহায়িকা ও দ্রুত লিংক</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.guideCard}>
          <Text style={styles.sectionLabel}>কীভাবে বিক্রি করবেন</Text>
          <Text style={styles.guideBody}>
            ১) প্রোফাইল থেকে প্রোডাক্ট আপলোড করুন।{"\n"}
            ২) অর্ডার এলে Sales থেকে স্ট্যাটাস আপডেট করুন।{"\n"}
            ৩) ক্রেতার সাথে Messages দিয়ে যোগাযোগ রাখুন।{"\n"}
            ৪) প্রয়োজনে Featured / Advertise অপশন ব্যবহার করুন।
          </Text>
        </View>

        <View style={styles.guideCard}>
          <Text style={styles.sectionLabel}>অর্ডার স্ট্যাটাস</Text>
          <Text style={styles.guideBody}>
            Pending → Processing → Shipped → Completed{"\n"}
            Completed মানে ডেলিভারি সম্পন্ন; ক্রেতা তখন রিভিউ দিতে পারেন।
          </Text>
        </View>

        <View style={styles.guideCard}>
          <Text style={styles.sectionLabel}>নিরাপদ বিক্রি</Text>
          <Text style={styles.guideBody}>
            • অ্যাপের ভিতরেই অর্ডার ও মেসেজ ব্যবহার করুন।{"\n"}
            • সমস্যা হলে Support ব্যবহার করুন।{"\n"}
            • রিপোর্ট পেলে অ্যাডমিন নির্দেশনা অনুসরণ করুন।
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 8, marginBottom: 10 }]}>
          দ্রুত লিংক
        </Text>
        <HubLink title="সেলস অর্ডার" onPress={() => router.push("/sales")} />
        <HubLink
          title="প্রোডাক্ট আপলোড"
          onPress={() => router.push("/productUpload")}
        />
        <HubLink title="সাপোর্ট" onPress={() => router.push("/support")} />
        <HubLink title="অ্যাপ সম্পর্কে" onPress={() => router.push("/aboutApp")} />
        <HubLink
          title="গোপনীয়তা নীতি"
          onPress={() => router.push("/privacyPolicy")}
        />
        <HubLink
          title="শর্তাবলী"
          onPress={() => router.push("/termsAndConditions")}
        />
      </ScrollView>
    </View>
  );
}

/* ===================== RETAIL: USEFUL GUIDE ===================== */

function RetailHub() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hub</Text>
        <Text style={styles.headerSub}>সহায়িকা ও দ্রুত লিংক</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.guideCard}>
          <Text style={styles.sectionLabel}>কীভাবে অর্ডার করবেন</Text>
          <Text style={styles.guideBody}>
            ১) হোমে প্রোডাক্ট ব্রাউজ করুন বা ক্যাটাগরি বেছে নিন।{"\n"}
            ২) প্রোডাক্ট খুলে ভ্যারিয়েন্ট/সাইজ ও পরিমাণ সিলেক্ট করুন (MOQ মেনে)।{"\n"}
            ৩) চেকআউট সম্পন্ন করুন।{"\n"}
            ৪) প্রোফাইল → My Orders থেকে স্ট্যাটাস দেখুন।
          </Text>
        </View>

        <View style={styles.guideCard}>
          <Text style={styles.sectionLabel}>অর্ডার স্ট্যাটাস</Text>
          <Text style={styles.guideBody}>
            Pending → Processing → Shipped → Completed{"\n"}
            Completed মানে ডেলিভারি সম্পন্ন; এর পর রিভিউ দিতে পারবেন।
          </Text>
        </View>

        <View style={styles.guideCard}>
          <Text style={styles.sectionLabel}>নিরাপদ কেনাবেচা</Text>
          <Text style={styles.guideBody}>
            • অ্যাপের ভিতরেই অর্ডার ও মেসেজ ব্যবহার করুন।{"\n"}
            • বড় অর্ডারের আগে সেলারকে মেসেজ করে নিশ্চিত হোন।{"\n"}
            • সমস্যা হলে Support বা Report ব্যবহার করুন।
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 8, marginBottom: 10 }]}>
          দ্রুত লিংক
        </Text>
        <HubLink title="আমার অর্ডার" onPress={() => router.push("/orders")} />
        <HubLink title="সাপোর্ট" onPress={() => router.push("/support")} />
        <HubLink title="অ্যাপ সম্পর্কে" onPress={() => router.push("/aboutApp")} />
        <HubLink
          title="গোপনীয়তা নীতি"
          onPress={() => router.push("/privacyPolicy")}
        />
        <HubLink
          title="শর্তাবলী"
          onPress={() => router.push("/termsAndConditions")}
        />
      </ScrollView>
    </View>
  );
}

function HubLink({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable style={styles.linkRow} onPress={onPress}>
      <Text style={styles.linkText}>{title}</Text>
      <Text style={styles.linkChevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  signInBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  signInBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  headerSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  guideCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  guideBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563",
  },
  linkRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  linkChevron: {
    fontSize: 20,
    color: "#9CA3AF",
    fontWeight: "300",
  },
});
