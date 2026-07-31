import ConfirmModal from "@/components/modal/ConfirmModal";
import { useProfile } from "@/hooks/useProfile";
import {
  PLATFORM_BKASH_NUMBER,
  PLATFORM_FEE_MAX_DUE,
  PLATFORM_FEE_RATE,
  PLATFORM_FEE_WARN_AT,
  PlatformFeeSummary,
  fetchPlatformFeeSummary,
  formatBdt,
  getFeeAlertLevel,
  submitPlatformFeePayment,
} from "@/lib/platformFee";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
      </View>
    );
  }

  return isWholesale ? <WholesaleHub profileId={profile.id} /> : <RetailHub />;
}

/* ===================== WHOLESALE: PLATFORM FEE ===================== */

function WholesaleHub({ profileId }: { profileId: string }) {
  const [summary, setSummary] = useState<PlatformFeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      try {
        const next = await fetchPlatformFeeSummary(profileId);
        setSummary(next);
        if (next.outstanding > 0) {
          setAmount(String(Math.round(next.outstanding)));
        }
      } catch (err) {
        if (__DEV__) console.warn("[Hub] fee summary failed:", err);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [profileId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const next = await fetchPlatformFeeSummary(profileId);
      setSummary(next);
    } catch {
      /* ignore */
    }
    setRefreshing(false);
  };

  const alertLevel = summary
    ? getFeeAlertLevel(summary.outstanding)
    : "ok";

  const alertCard = useMemo(() => {
    if (!summary) return null;
    if (alertLevel === "clear") {
      return {
        style: styles.alertClear,
        title: "কোনো বকেয়া নেই",
        body: "আপনার প্ল্যাটফর্ম ফি পরিশোধিত আছে। ধন্যবাদ!",
      };
    }
    if (alertLevel === "critical") {
      return {
        style: styles.alertCritical,
        title: "জরুরি: পেমেন্ট বকেয়া",
        body: `আপনার বকেয়া ${formatBdt(summary.outstanding)} (সর্বোচ্চ সীমা ${formatBdt(PLATFORM_FEE_MAX_DUE)})। দয়া করে দ্রুত bKash-এ পরিশোধ করুন।`,
      };
    }
    if (alertLevel === "warn") {
      return {
        style: styles.alertWarn,
        title: "সতর্কতা: পেমেন্ট শীঘ্রই বাকি",
        body: `আপনার বকেয়া ${formatBdt(summary.outstanding)}। ${formatBdt(PLATFORM_FEE_WARN_AT)} ছুঁয়ে গেছে — সীমা ${formatBdt(PLATFORM_FEE_MAX_DUE)} এর আগে পরিশোধ করুন।`,
      };
    }
    return {
      style: styles.alertOk,
      title: "প্ল্যাটফর্ম ফি বকেয়া",
      body: `সম্পূর্ণ বিক্রয়ের ১% ফি হিসেবে আপনার বকেয়া ${formatBdt(summary.outstanding)}।`,
    };
  }, [summary, alertLevel]);

  const handleSubmit = async () => {
    if (!summary) return;

    if (summary.pendingPayment) {
      Alert.alert(
        "অপেক্ষমাণ অনুরোধ",
        "আপনার আগের পেমেন্ট প্রুফ এখনো রিভিউ হচ্ছে। অনুমোদনের পর নতুন করে জমা দিন।"
      );
      return;
    }

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert("ভুল পরিমাণ", "যে পরিমাণ পাঠিয়েছেন সেটি সঠিকভাবে লিখুন।");
      return;
    }
    if (!bkashNumber.trim() || bkashNumber.trim().length < 11) {
      Alert.alert(
        "bKash নম্বর প্রয়োজন",
        "যে bKash নম্বর থেকে টাকা পাঠিয়েছেন সেটি লিখুন (১১ ডিজিট)।"
      );
      return;
    }
    if (!reference.trim() || reference.trim().length < 4) {
      Alert.alert(
        "রেফারেন্স প্রয়োজন",
        "bKash Transaction ID / Reference নম্বর সঠিকভাবে লিখুন।"
      );
      return;
    }

    try {
      setSubmitting(true);
      await submitPlatformFeePayment({
        sellerId: profileId,
        amountBdt: amountNum,
        bkashNumber: bkashNumber.trim(),
        transactionReference: reference.trim(),
        salesTotalSnapshot: summary.salesTotal,
        feeFromSalesSnapshot: summary.feeFromSales,
        feeDueSnapshot: summary.outstanding,
        approvedPaidSnapshot: summary.approvedPaid,
      });
      setShowSuccess(true);
      setReference("");
      setBkashNumber("");
      await onRefresh();
    } catch (err: any) {
      if (err?.code === "23505") {
        Alert.alert(
          "অপেক্ষমাণ অনুরোধ",
          "ইতিমধ্যে একটি পেমেন্ট প্রুফ পেন্ডিং আছে।"
        );
        await onRefresh();
        return;
      }
      Alert.alert(
        "জমা ব্যর্থ",
        err?.message || "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !summary || !alertCard) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  const dueColor =
    alertLevel === "critical"
      ? "#b91c1c"
      : alertLevel === "warn"
        ? "#a16207"
        : alertLevel === "clear"
          ? "#15803d"
          : "#111827";

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hub</Text>
        <Text style={styles.headerSub}>প্ল্যাটফর্ম ফি ও পেমেন্ট</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
      >
        <View style={[styles.alertCard, alertCard.style]}>
          <Text style={styles.alertTitle}>{alertCard.title}</Text>
          <Text style={styles.alertBody}>{alertCard.body}</Text>
        </View>

        <View style={styles.meterCard}>
          <Text style={styles.sectionLabel}>হিসাব সারাংশ</Text>
          <Text style={[styles.dueAmount, { color: dueColor }]}>
            {formatBdt(summary.outstanding)}
          </Text>
          <Text style={styles.dueCaption}>
            এখন পরিশোধযোগ্য বকেয়া (একসাথে সর্বোচ্চ {formatBdt(PLATFORM_FEE_MAX_DUE)})
          </Text>

          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${Math.min(100, (summary.outstanding / PLATFORM_FEE_MAX_DUE) * 100)}%`,
                  backgroundColor:
                    alertLevel === "critical"
                      ? "#ef4444"
                      : alertLevel === "warn"
                        ? "#eab308"
                        : PRIMARY,
                },
              ]}
            />
          </View>
          <View style={styles.meterLabels}>
            <Text style={styles.meterLabel}>০</Text>
            <Text style={styles.meterLabel}>{formatBdt(PLATFORM_FEE_WARN_AT)}</Text>
            <Text style={styles.meterLabel}>{formatBdt(PLATFORM_FEE_MAX_DUE)}</Text>
          </View>

          <View style={styles.statRow}>
            <Stat
              label="মোট বিক্রয় (completed)"
              value={formatBdt(summary.salesTotal)}
            />
            <Stat
              label={`বিক্রয় থেকে ফি (${PLATFORM_FEE_RATE * 100}%)`}
              value={formatBdt(summary.feeFromSales)}
            />
          </View>
          <View style={styles.statRow}>
            <Stat
              label="পরিশোধিত (অনুমোদিত)"
              value={formatBdt(summary.approvedPaid)}
            />
            <Stat
              label="যাচাইয়ের অপেক্ষায়"
              value={formatBdt(summary.pendingPaid)}
            />
          </View>
          <View style={styles.statRow}>
            <Stat label="এখন বকেয়া" value={formatBdt(summary.outstanding)} />
            <Stat
              label="মোট অপরিশোধিত ব্যালেন্স"
              value={formatBdt(Math.max(0, summary.balance))}
            />
          </View>

          {summary.deferredBeyondCap > 0 ? (
            <Text style={styles.capNote}>
              নোট: বিক্রয় থেকে আরও {formatBdt(summary.deferredBeyondCap)} ফি
              জমেছে। এখন সর্বোচ্চ {formatBdt(PLATFORM_FEE_MAX_DUE)} পরিশোধ
              করুন; অনুমোদনের পর বাকি বকেয়া আপডেট হবে।
            </Text>
          ) : null}
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.sectionLabel}>bKash পেমেন্ট নির্দেশনা</Text>
          <Text style={styles.instructionBody}>
            ১) নিচের bKash নম্বরে Send Money করুন (পার্সোনাল নম্বর)।{"\n"}
            ২) পরিমাণ = আপনার এখনকার বকেয়া ফি।{"\n"}
            ৩) পাঠানোর পর নিচে লিখুন: পাঠানো টাকা, TrxID / Reference, এবং যে
            নম্বর থেকে পাঠিয়েছেন।{"\n"}
            ৪) আমাদের টিম ম্যানুয়ালি যাচাই করে অনুমোদন করবে — অনুমোদনের আগে
            বকেয়া কমবে না।
          </Text>
          <View style={styles.merchantBox}>
            <Text style={styles.merchantLabel}>আমাদের bKash নম্বর</Text>
            <Text style={styles.merchantNumber}>{PLATFORM_BKASH_NUMBER}</Text>
          </View>
        </View>

        {summary.pendingPayment ? (
          <View style={styles.pendingCard}>
            <Text style={styles.sectionLabel}>পেন্ডিং প্রুফ</Text>
            <Text style={styles.pendingBody}>
              {formatBdt(summary.pendingPayment.amount_bdt)} · Ref:{" "}
              {summary.pendingPayment.transaction_reference}
              {"\n"}
              জমার তারিখ:{" "}
              {new Date(summary.pendingPayment.created_at).toLocaleDateString()}
              {"\n"}
              রিভিউ সম্পন্ন হলে বকেয়া আপডেট হবে।
            </Text>
          </View>
        ) : summary.outstanding > 0 ? (
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>পেমেন্ট প্রুফ জমা দিন</Text>

            <Text style={styles.inputLabel}>পাঠানো পরিমাণ (BDT)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="যেমন: 1000"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Transaction / Reference নম্বর</Text>
            <TextInput
              style={styles.input}
              value={reference}
              onChangeText={setReference}
              autoCapitalize="characters"
              placeholder="bKash TrxID"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>যে bKash নম্বর থেকে পাঠিয়েছেন</Text>
            <TextInput
              style={styles.input}
              value={bkashNumber}
              onChangeText={setBkashNumber}
              keyboardType="phone-pad"
              placeholder="01XXXXXXXXX"
              placeholderTextColor="#9CA3AF"
            />

            <Pressable
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? "জমা হচ্ছে..." : "প্রুফ জমা দিন"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {summary.recentPayments.length > 0 ? (
          <View style={styles.historyCard}>
            <Text style={styles.sectionLabel}>পেমেন্ট ইতিহাস</Text>
            {summary.recentPayments.map((p) => (
              <View key={p.id} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyAmount}>
                    {formatBdt(p.amount_bdt)}
                  </Text>
                  <Text style={styles.historyMeta}>
                    {p.transaction_reference} ·{" "}
                    {new Date(p.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <StatusPill status={p.status} />
              </View>
            ))}
          </View>
        ) : null}

        <Pressable
          style={styles.linkRow}
          onPress={() => router.push("/sales")}
        >
          <Text style={styles.linkText}>সেলস অর্ডার দেখুন</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={showSuccess}
        title="প্রুফ জমা হয়েছে"
        description="আপনার bKash পেমেন্ট প্রুফ জমা হয়েছে। আমাদের টিম যাচাই করে শীঘ্রই আপডেট করবে।"
        confirmText="ঠিক আছে"
        cancelText={null}
        onConfirm={() => setShowSuccess(false)}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "#FEF3C7", color: "#92400E", label: "পেন্ডিং" },
    approved: { bg: "#DCFCE7", color: "#166534", label: "অনুমোদিত" },
    rejected: { bg: "#FEE2E2", color: "#991B1B", label: "বাতিল" },
  };
  const s = map[status] ?? map.pending;
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.pillText, { color: s.color }]}>{s.label}</Text>
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
  },
  header: {
    backgroundColor: "#000000",
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSub: {
    marginTop: 4,
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "500",
  },
  content: {
    padding: 14,
    paddingBottom: 120,
  },
  alertCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertOk: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },
  alertWarn: {
    backgroundColor: "#FEF9C3",
    borderColor: "#FDE047",
  },
  alertCritical: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
  },
  alertClear: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  alertBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#374151",
  },
  meterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  dueAmount: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  dueCaption: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 14,
  },
  capNote: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: "#92400E",
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 8,
  },
  meterTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 999,
  },
  meterLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 14,
  },
  meterLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  statRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  instructionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  instructionBody: {
    fontSize: 13,
    lineHeight: 21,
    color: "#374151",
    marginBottom: 12,
  },
  merchantBox: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 14,
  },
  merchantLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginBottom: 4,
  },
  merchantNumber: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  pendingCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  pendingBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#78350F",
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  historyMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  guideCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  guideBody: {
    fontSize: 13,
    lineHeight: 21,
    color: "#374151",
  },
  linkRow: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  linkChevron: {
    fontSize: 22,
    color: "#9CA3AF",
    fontWeight: "300",
  },
});
