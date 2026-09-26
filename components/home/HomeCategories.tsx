import {
  fetchCategories,
  fetchSubcategories,
} from "@/lib/catalogApi";
import Feather from "@expo/vector-icons/Feather";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const PRIMARY = "#f5832b";
const ACCENTS = [
  "#f5832b",
  "#0f766e",
  "#1d4ed8",
  "#b45309",
  "#be123c",
  "#4338ca",
];

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  expanded?: boolean;
  onToggleExpanded?: () => void;
  /** Lock the parent Products↔Manufacturers pager while this strip is touched */
  onNestedHorizontalFocus?: (focused: boolean) => void;
};

function getAccent(index: number) {
  return ACCENTS[index % ACCENTS.length];
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/**
 * JBH category browse strip with simple chevron expand/collapse.
 */
export default function HomeCategories({
  selectedCategoryId,
  selectedSubcategoryId,
  onSelectCategory,
  onSelectSubcategory,
  expanded = false,
  onToggleExpanded,
  onNestedHorizontalFocus,
}: HomeCategoriesProps) {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [subcategories, setSubcategories] = useState<HomeSubcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const catScrollRef = useRef<ScrollView>(null);
  const subScrollRef = useRef<ScrollView>(null);
  const catScrollXRef = useRef(0);
  const subScrollXRef = useRef(0);

  const rememberCatScroll = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    catScrollXRef.current = e.nativeEvent.contentOffset.x;
  };

  const rememberSubScroll = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    subScrollXRef.current = e.nativeEvent.contentOffset.x;
  };

  const restoreCatScroll = () => {
    const x = catScrollXRef.current;
    if (x > 0) {
      requestAnimationFrame(() => {
        catScrollRef.current?.scrollTo({ x, y: 0, animated: false });
      });
    }
  };

  const restoreSubScroll = () => {
    const x = subScrollXRef.current;
    if (x > 0) {
      requestAnimationFrame(() => {
        subScrollRef.current?.scrollTo({ x, y: 0, animated: false });
      });
    }
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await fetchCategories();
      const subArrays = await Promise.all(
        cats.map(async (c) => {
          const subs = await fetchSubcategories(c.id);
          return subs.map((s) => ({
            id: s.id,
            name: s.name,
            category_id: s.category_id ?? c.id,
          }));
        })
      );
      setCategories(cats);
      setSubcategories(subArrays.flat());
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

  const handleChevron = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleExpanded?.();
  };

  const renderChip = (
    key: string,
    label: string,
    active: boolean,
    accent: string,
    onPress: () => void,
    isAll = false
  ) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[styles.catChip, expanded && styles.catChipWrapped]}
    >
      <View
        style={[
          styles.catAvatar,
          isAll
            ? active
              ? styles.catAvatarActive
              : { backgroundColor: "#F3F4F6" }
            : { backgroundColor: active ? PRIMARY : `${accent}18` },
        ]}
      >
        <Text
          style={[
            styles.catInitial,
            isAll && active && styles.catInitialActive,
            !isAll && { color: active ? "#fff" : accent },
          ]}
        >
          {isAll ? "All" : getInitial(label)}
        </Text>
      </View>
      <Text
        numberOfLines={2}
        style={[styles.catLabel, active && styles.catLabelActive]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const bindNestedHorizontal = {
    onTouchStart: () => onNestedHorizontalFocus?.(true),
    onTouchEnd: () => onNestedHorizontalFocus?.(false),
    onTouchCancel: () => onNestedHorizontalFocus?.(false),
  };

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
        <ActivityIndicator color={PRIMARY} style={{ marginTop: 8 }} size="small" />
      </View>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const chips = (
    <>
      {renderChip(
        "all",
        "All",
        !selectedCategoryId,
        PRIMARY,
        () => {
          onSelectCategory(null);
          onSelectSubcategory(null);
        },
        true
      )}
      {categories.map((cat, index) => {
        const active = selectedCategoryId === cat.id;
        return renderChip(
          cat.id,
          cat.name,
          active,
          getAccent(index),
          () => {
            if (active) {
              onSelectCategory(null);
              onSelectSubcategory(null);
            } else {
              onSelectCategory(cat.id);
              onSelectSubcategory(null);
            }
          }
        );
      })}
    </>
  );

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

      <View style={styles.barRow}>
        <View style={styles.chipsArea}>
          {expanded ? (
            <View style={styles.catWrap}>{chips}</View>
          ) : (
            <ScrollView
              ref={catScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catScroll}
              nestedScrollEnabled
              directionalLockEnabled
              scrollEventThrottle={16}
              onScroll={rememberCatScroll}
              onContentSizeChange={restoreCatScroll}
              {...bindNestedHorizontal}
            >
              {chips}
            </ScrollView>
          )}
        </View>

        <Pressable
          onPress={handleChevron}
          style={styles.chevronBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            expanded ? "Collapse categories" : "Expand categories"
          }
        >
          <View style={styles.chevronDivider} />
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#374151"
          />
        </Pressable>
      </View>

      {selectedCategoryId && visibleSubs.length > 0 ? (
        <View style={styles.subSection}>
          <Text style={styles.subHeading}>
            {selectedCategoryName
              ? `${selectedCategoryName} · subtypes`
              : "Subcategories"}
          </Text>
          <ScrollView
            ref={subScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subScroll}
            nestedScrollEnabled
            directionalLockEnabled
            scrollEventThrottle={16}
            onScroll={rememberSubScroll}
            onContentSizeChange={restoreSubScroll}
            {...bindNestedHorizontal}
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
  barRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  chipsArea: {
    flex: 1,
  },
  catScroll: {
    paddingHorizontal: 10,
    gap: 10,
  },
  catWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 10,
  },
  catChip: {
    width: 72,
    alignItems: "center",
  },
  catChipWrapped: {
    marginBottom: 2,
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
  chevronBtn: {
    width: 40,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chevronDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: "#D1D5DB",
    marginRight: 8,
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
