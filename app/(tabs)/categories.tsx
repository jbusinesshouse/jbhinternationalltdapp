import { supabase } from "@/lib/supabase";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY = "#f5832b";
const ACCENT_COLORS = ["#f5832b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"];

type CategoryProps = {
  id: string;
  name: string;
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function getAccentColor(index: number) {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

export default function Categories() {
  const navigation = useNavigation();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      if (__DEV__) {
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories(true);
  }, [fetchCategories]);

  const renderItem = ({ item, index }: { item: CategoryProps; index: number }) => {
    const accent = getAccentColor(index);

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        activeOpacity={0.75}
        onPress={() =>
          router.push({
            pathname: "/categoryProducts/[query]",
            params: { query: item.id, name: item.name },
          })
        }
      >
        <View style={[styles.categoryAccent, { backgroundColor: accent }]} />
        <View style={[styles.categoryIcon, { backgroundColor: `${accent}18` }]}>
          <Text style={[styles.categoryInitial, { color: accent }]}>
            {getInitial(item.name)}
          </Text>
        </View>
        <View style={styles.categoryContent}>
          <Text style={styles.categoryText}>{item.name}</Text>
          <Text style={styles.categoryHint}>Browse products</Text>
        </View>
        <Image
          source={require("@/assets/images/icons/chevron-right.png")}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No categories yet</Text>
        <Text style={styles.emptySubtitle}>
          Pull down to refresh or check back later.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Image
            source={require("@/assets/images/icons/chevron-right.png")}
            style={styles.backIcon}
          />
        </Pressable>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Categories</Text>
          {!loading && (
            <Text style={styles.headerSubtitle}>
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </Text>
          )}
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contentWrapper}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={PRIMARY} size="large" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.list,
              categories.length === 0 && styles.listEmpty,
            ]}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[PRIMARY]}
                tintColor={PRIMARY}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 18,
    height: 18,
    transform: [{ rotate: "180deg" }],
    tintColor: "#ffffff",
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
  },
  headerSpacer: {
    width: 36,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 16,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  list: {
    paddingBottom: 120,
  },
  listEmpty: {
    flexGrow: 1,
  },
  categoryItem: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingRight: 16,
    paddingLeft: 0,
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  categoryAccent: {
    width: 4,
    alignSelf: "stretch",
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
    marginRight: 14,
  },
  categoryInitial: {
    fontSize: 18,
    fontWeight: "700",
  },
  categoryContent: {
    flex: 1,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
  },
  categoryHint: {
    marginTop: 3,
    fontSize: 13,
    color: "#9CA3AF",
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: "#D1D5DB",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
});
