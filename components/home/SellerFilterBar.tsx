import type { SellerListItem } from "@/lib/catalogApi";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRIMARY = "#f5832b";

type SellerFilterBarProps = {
  sellers: SellerListItem[];
  loading: boolean;
  selectedSellerId: string | null;
  onSelectSeller: (sellerId: string | null) => void;
};

/**
 * Horizontal seller picker for Manufacturers mode.
 * Tap selects store filter; link icon opens public profile.
 */
export default function SellerFilterBar({
  sellers,
  loading,
  selectedSellerId,
  onSelectSeller,
}: SellerFilterBarProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Sellers</Text>
        <ActivityIndicator color={PRIMARY} style={{ marginVertical: 12 }} />
      </View>
    );
  }

  if (sellers.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Sellers</Text>
        <Text style={styles.empty}>
          No active sellers with products yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Sellers</Text>
        <Text style={styles.hint}>Tap to filter products</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Pressable
          onPress={() => onSelectSeller(null)}
          style={styles.chip}
        >
          <View
            style={[
              styles.avatar,
              !selectedSellerId ? styles.avatarActive : styles.avatarMuted,
            ]}
          >
            <Feather
              name="users"
              size={20}
              color={!selectedSellerId ? "#fff" : "#6B7280"}
            />
          </View>
          <Text
            style={[styles.name, !selectedSellerId && styles.nameActive]}
            numberOfLines={2}
          >
            All sellers
          </Text>
        </Pressable>

        {sellers.map((seller) => {
          const active = selectedSellerId === seller.id;
          const label =
            seller.store_name?.trim() ||
            seller.full_name?.trim() ||
            "Store";
          return (
            <View key={seller.id} style={styles.chipWrap}>
              <Pressable
                onPress={() => onSelectSeller(active ? null : seller.id)}
                style={styles.chip}
              >
                <Image
                  source={
                    seller.avatar_url
                      ? { uri: seller.avatar_url }
                      : require("@/assets/images/store1.jpg")
                  }
                  style={[styles.avatarImg, active && styles.avatarImgActive]}
                />
                <Text
                  style={[styles.name, active && styles.nameActive]}
                  numberOfLines={2}
                >
                  {label}
                </Text>
                {seller.product_count > 0 ? (
                  <Text style={styles.count}>{seller.product_count} items</Text>
                ) : null}
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/publicProfile/[id]",
                    params: { id: seller.id },
                  })
                }
                hitSlop={6}
                style={styles.profileBtn}
                accessibilityLabel={`Open ${label} profile`}
              >
                <Feather name="external-link" size={12} color={PRIMARY} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  heading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  hint: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  empty: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    fontSize: 13,
    color: "#9CA3AF",
  },
  scroll: {
    paddingHorizontal: 10,
    gap: 10,
  },
  chipWrap: {
    position: "relative",
  },
  chip: {
    width: 80,
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarActive: {
    backgroundColor: PRIMARY,
  },
  avatarMuted: {
    backgroundColor: "#F3F4F6",
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarImgActive: {
    borderColor: PRIMARY,
  },
  name: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 14,
  },
  nameActive: {
    color: "#111827",
    fontWeight: "700",
  },
  count: {
    marginTop: 2,
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  profileBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFEDD5",
  },
});
