import type { CatalogStoreType } from "@/hooks/useCatalogPrefs";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#f5832b";

const OPTIONS: { value: CatalogStoreType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "retail", label: "Retail" },
  { value: "wholesale", label: "Wholesale" },
];

type StoreTypeFilterProps = {
  value: CatalogStoreType;
  onChange: (value: CatalogStoreType) => void;
};

/**
 * All / Retail / Wholesale product browse filter (home + search).
 */
export default function StoreTypeFilter({
  value,
  onChange,
}: StoreTypeFilterProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Show ${opt.label} products`}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  textActive: {
    color: "#ffffff",
  },
});
