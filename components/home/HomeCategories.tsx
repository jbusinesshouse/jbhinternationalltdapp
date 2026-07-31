import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRIMARY = "#f5832b";
const ACCENTS = [
  "#f5832b",
  "#0f766e",
  "#1d4ed8",
  "#b45309",
  "#be123c",
  "#4338ca",
];

export type HomeCategory = {
  id: string;
  name: string;
};

export type HomeSubcategory = {
  id: string;
  name: string;
  category_id: string;
};

type HomeCategoriesProps = {
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectSubcategory: (subcategoryId: string | null) => void;
};

function getAccent(index: number) {
  return ACCENTS[index % ACCENTS.length];
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/**
 * Alibaba-style category + subcategory browse strip for Home.
 */
export default function HomeCategories({
  selectedCategoryId,
  selectedSubcategoryId,
  onSelectCategory,
  onSelectSubcategory,
}: HomeCategoriesProps) {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [subcategories, setSubcategories] = useState<HomeSubcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, subRes] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase
          .from("subcategories")
          .select("id, name, category_id")
          .order("name"),
      ]);

      if (catRes.error) throw catRes.error;
      if (subRes.error) throw subRes.error;

      setCategories((catRes.data as HomeCategory[]) ?? []);
      setSubcategories((subRes.data as HomeSubcategory[]) ?? []);
    } catch (error) {
      if (__DEV__) {
        console.warn("[HomeCategories] load failed:", error);
      }
      setCategories([]);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleSubs = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subcategories.filter((s) => s.category_id === selectedCategoryId);
  }, [selectedCategoryId, subcategories]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId)?.name ?? null;
  }, [categories, selectedCategoryId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.heading}>Browse categories</Text>
        </View>
        <View style={styles.skeletonRow}>
          {Array.from({ length: 6 }, (_, i) => (
            <View key={`sk-${i}`} style={styles.skeletonChip} />
          ))}
        </View>
        <ActivityIndicator
          color={PRIMARY}
          style={{ marginTop: 8 }}
          size="small"
        />
      </View>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingBar} />
        <Text style={styles.heading}>Browse categories</Text>
        {selectedCategoryId ? (
          <Pressable
            onPress={() => {
              onSelectCategory(null);
              onSelectSubcategory(null);
            }}
            hitSlop={8}
            style={styles.clearBtn}
          >
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}
      >
        <Pressable
          onPress={() => {
            onSelectCategory(null);
            onSelectSubcategory(null);
          }}
          style={[
            styles.catChip,
            !selectedCategoryId && styles.catChipActive,
          ]}
        >
          <View
            style={[
              styles.catAvatar,
              !selectedCategoryId
                ? styles.catAvatarActive
                : { backgroundColor: "#F3F4F6" },
            ]}
          >
            <Text
              style={[
                styles.catInitial,
                !selectedCategoryId && styles.catInitialActive,
              ]}
            >
              All
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={[
              styles.catLabel,
              !selectedCategoryId && styles.catLabelActive,
            ]}
          >
            All
          </Text>
        </Pressable>

        {categories.map((cat, index) => {
          const active = selectedCategoryId === cat.id;
          const accent = getAccent(index);
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                if (active) {
                  onSelectCategory(null);
                  onSelectSubcategory(null);
                } else {
                  onSelectCategory(cat.id);
                  onSelectSubcategory(null);
                }
              }}
              style={[styles.catChip, active && styles.catChipActive]}
            >
              <View
                style={[
                  styles.catAvatar,
                  {
                    backgroundColor: active ? PRIMARY : `${accent}18`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catInitial,
                    { color: active ? "#fff" : accent },
                  ]}
                >
                  {getInitial(cat.name)}
                </Text>
              </View>
              <Text
                numberOfLines={2}
                style={[styles.catLabel, active && styles.catLabelActive]}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedCategoryId && visibleSubs.length > 0 ? (
        <View style={styles.subSection}>
          <Text style={styles.subHeading}>
            {selectedCategoryName
              ? `${selectedCategoryName} · subtypes`
              : "Subcategories"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subScroll}
          >
            <Pressable
              onPress={() => onSelectSubcategory(null)}
              style={[
                styles.subChip,
                !selectedSubcategoryId && styles.subChipActive,
              ]}
            >
              <Text
                style={[
                  styles.subText,
                  !selectedSubcategoryId && styles.subTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>
            {visibleSubs.map((sub) => {
              const active = selectedSubcategoryId === sub.id;
              return (
                <Pressable
                  key={sub.id}
                  onPress={() =>
                    onSelectSubcategory(active ? null : sub.id)
                  }
                  style={[styles.subChip, active && styles.subChipActive]}
                >
                  <Text
                    style={[styles.subText, active && styles.subTextActive]}
                  >
                    {sub.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
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
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  headingBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: PRIMARY,
    marginRight: 8,
  },
  heading: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.2,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY,
  },
  catScroll: {
    paddingHorizontal: 10,
    gap: 10,
  },
  catChip: {
    width: 72,
    alignItems: "center",
  },
  catChipActive: {
    opacity: 1,
  },
  catAvatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  catAvatarActive: {
    backgroundColor: PRIMARY,
  },
  catInitial: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  catInitialActive: {
    color: "#ffffff",
    fontSize: 12,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 14,
    textTransform: "capitalize",
  },
  catLabelActive: {
    color: "#111827",
    fontWeight: "700",
  },
  subSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  subHeading: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    paddingHorizontal: 12,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  subScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  subChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  subChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  subText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  subTextActive: {
    color: "#ffffff",
  },
  skeletonRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 10,
  },
  skeletonChip: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
});
