import type { GridColumns } from "@/hooks/useCatalogPrefs";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#f5832b";
const OPTIONS: GridColumns[] = [2, 3, 4];

type Props = {
  value: GridColumns;
  onChange: (columns: GridColumns) => void;
};

/** Toggle product listing between 2 / 3 / 4 columns. */
export default function GridColumnSwitcher({ value, onChange }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="toolbar">
      {OPTIONS.map((cols) => {
        const active = value === cols;
        return (
          <Pressable
            key={cols}
            onPress={() => onChange(cols)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${cols} column layout`}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Feather
              name="grid"
              size={cols === 2 ? 14 : cols === 3 ? 13 : 12}
              color={active ? "#fff" : "#6B7280"}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {cols}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnActive: {
    backgroundColor: PRIMARY,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  labelActive: {
    color: "#ffffff",
  },
});
