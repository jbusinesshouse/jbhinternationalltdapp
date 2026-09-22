import { useProfile } from "@/hooks/useProfile";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#f5832b";

type QuickAction = {
  key: string;
  label: string;
  icon: ComponentProps<typeof Feather>["name"];
  onPress: () => void;
};

type Props = {
  /** Switch home to Manufacturers / sellers mode */
  onBrowseSellers?: () => void;
};

/**
 * Home shortcuts to existing app routes (no duplicate category browse).
 * Wholesalers get Sales; buyers get My Orders.
 */
export default function QuickActionsRow({ onBrowseSellers }: Props) {
  const { profile } = useProfile();
  const isWholesale = profile?.store_type === "wholesale";

  const actions: QuickAction[] = [
    {
      key: "sellers",
      label: "Find\nsellers",
      icon: "briefcase",
      onPress: () => {
        if (onBrowseSellers) {
          onBrowseSellers();
          return;
        }
        router.push("/(tabs)/hub");
      },
    },
    {
      key: "messages",
      label: "Messages",
      icon: "message-circle",
      onPress: () => router.push("/(tabs)/messages"),
    },
    {
      key: "orders",
      label: isWholesale ? "My\nsales" : "My\norders",
      icon: "package",
      onPress: () =>
        router.push(isWholesale ? "/sales" : "/orders"),
    },
    {
      key: "support",
      label: "Support",
      icon: "help-circle",
      onPress: () => router.push("/support"),
    },
  ];

  return (
    <View style={styles.row}>
      {actions.map((a) => (
        <Pressable
          key={a.key}
          onPress={a.onPress}
          style={styles.item}
          accessibilityRole="button"
          accessibilityLabel={a.label.replace("\n", " ")}
        >
          <View style={styles.iconWrap}>
            <Feather name={a.icon} size={20} color={PRIMARY} />
          </View>
          <Text style={styles.label}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 14,
  },
});
