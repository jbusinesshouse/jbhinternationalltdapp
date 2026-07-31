import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type StoreProductSearchProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
};

/**
 * Compact search field for filtering a store's product list client-side.
 */
export default function StoreProductSearch({
  value,
  onChangeText,
  placeholder = "Search products in this store",
  resultCount,
  totalCount,
}: StoreProductSearchProps) {
  const hint = useMemo(() => {
    if (totalCount == null || resultCount == null) return null;
    if (!value.trim()) return null;
    return `${resultCount} of ${totalCount}`;
  }, [value, resultCount, totalCount]);

  return (
    <View style={styles.wrap}>
      <View style={styles.inputWrap}>
        <Image
          source={require("@/assets/images/icons/search.png")}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText("")}
            hitSlop={8}
            style={styles.clearBtn}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

/** Case-insensitive name match used by account + store preview. */
export function filterProductsByName<T extends { name: string }>(
  products: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => p.name.toLowerCase().includes(q));
}

export function useStoreProductSearch<T extends { name: string }>(
  products: T[]
) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterProductsByName(products, query),
    [products, query]
  );
  return { query, setQuery, filtered };
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    width: 16,
    height: 16,
    opacity: 0.45,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  clearText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "700",
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
