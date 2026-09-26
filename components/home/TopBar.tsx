import { useUser } from "@/context/UserContext";
import type { HomeMode } from "@/hooks/useCatalogPrefs";
import { fetchUnreadNotificationCount } from "@/lib/catalogApi";
import { goToSignIn } from "@/lib/guestAuth";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const PRIMARY = "#f5832b";
const TAB_GAP = 16;

const TABS: { key: HomeMode; label: string }[] = [
  { key: "products", label: "Products" },
  { key: "manufacturers", label: "Manufacturers" },
];

type TopBarProps = {
  activeMode?: HomeMode;
  onModeChange?: (mode: HomeMode) => void;
  /** Pager contentOffset.x — drives the sliding underline while swiping */
  scrollX?: SharedValue<number>;
  pageWidth?: number;
};

function ModeTab({
  label,
  active,
  onPress,
  onLayout,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const focus = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    focus.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, focus]);

  const inactiveStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focus.value, [0, 1], [1, 0]),
  }));

  const activeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focus.value, [0, 1], [0, 1]),
  }));

  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      style={styles.tabBtn}
      hitSlop={4}
    >
      <View style={styles.tabLabelWrap}>
        <Text
          numberOfLines={1}
          style={[styles.tabTextActive, styles.tabTextSizer]}
        >
          {label}
        </Text>
        <Animated.Text
          numberOfLines={1}
          style={[styles.tabTextActive, styles.tabTextFill, activeStyle]}
        >
          {label}
        </Animated.Text>
        <Animated.Text
          numberOfLines={1}
          style={[styles.tabText, styles.tabTextFill, inactiveStyle]}
        >
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
}

/**
 * JBH home header: Products / Manufacturers mode tabs + search.
 * Underline tracks pager scroll; label active state eases in after settle.
 */
const TopBar = ({
  activeMode = "products",
  onModeChange,
  scrollX,
  pageWidth = 1,
}: TopBarProps) => {
  const { user, loading: authLoading } = useUser();
  const [searchVal, setSearchVal] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const tab0X = useSharedValue(0);
  const tab0W = useSharedValue(72);
  const tab1X = useSharedValue(88);
  const tab1W = useSharedValue(110);

  const fallbackScrollX = useSharedValue(
    activeMode === "manufacturers" ? Math.max(pageWidth, 1) : 0
  );
  const effectiveScrollX = scrollX ?? fallbackScrollX;
  const pageWidthSV = useSharedValue(Math.max(pageWidth, 1));

  useEffect(() => {
    pageWidthSV.value = Math.max(pageWidth, 1);
  }, [pageWidth, pageWidthSV]);

  // Keep fallback in sync when parent doesn't drive scrollX (tab-only updates)
  useEffect(() => {
    if (scrollX) return;
    fallbackScrollX.value = withTiming(
      activeMode === "manufacturers" ? pageWidthSV.value : 0,
      { duration: 220 }
    );
  }, [activeMode, scrollX, fallbackScrollX, pageWidthSV]);

  const handleSearch = () => {
    if (!searchVal?.trim()) return;
    router.push({
      pathname: "/search/[query]",
      params: { query: searchVal },
    });
  };

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      if (!user) return;
      const count = await fetchUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch (err) {
      if (__DEV__) {
        console.log("Notification error:", err);
      }
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 10000);
    return () => clearInterval(interval);
  }, [authLoading, fetchUnreadNotifications]);

  const onTabLayout = (index: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    if (width <= 0) return;
    if (index === 0) {
      tab0X.value = x;
      tab0W.value = width;
    } else {
      tab1X.value = x;
      tab1W.value = width;
    }
  };

  const underlineStyle = useAnimatedStyle(() => {
    const width = Math.max(pageWidthSV.value, 1);
    const p = Math.min(1, Math.max(0, effectiveScrollX.value / width));
    const left = tab0X.value + (tab1X.value - tab0X.value) * p;
    const barWidth = tab0W.value + (tab1W.value - tab0W.value) * p;

    return {
      opacity: 1,
      width: barWidth,
      left,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.tabs}>
          {TABS.map((tab, index) => (
            <ModeTab
              key={tab.key}
              label={tab.label}
              active={activeMode === tab.key}
              onPress={() => onModeChange?.(tab.key)}
              onLayout={(e) => onTabLayout(index, e)}
            />
          ))}
          <Animated.View
            pointerEvents="none"
            style={[styles.tabUnderline, underlineStyle]}
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            if (!user) {
              goToSignIn("/notifications");
              return;
            }
            router.push("/notifications");
          }}
        >
          <View style={styles.bellWrap}>
            <Image
              source={require("@/assets/images/icons/bell.png")}
              style={styles.notiImage}
            />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInp}
          placeholder="Search For Products"
          placeholderTextColor="#9CA3AF"
          value={searchVal}
          onChangeText={setSearchVal}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Image
            source={require("@/assets/images/icons/search.png")}
            style={styles.searchImg}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TopBar;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 15,
    backgroundColor: "#000000",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  tabs: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: TAB_GAP,
    position: "relative",
    marginRight: 8,
  },
  tabBtn: {
    paddingBottom: 8,
    flexShrink: 0,
  },
  tabLabelWrap: {
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.65)",
  },
  tabTextActive: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  tabTextSizer: {
    opacity: 0,
  },
  /** Animated layers sit on top of the invisible sizer */
  tabTextFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  bellWrap: {
    position: "relative",
    marginBottom: 6,
    marginLeft: 8,
  },
  notiImage: {
    width: 22,
    height: 22,
    filter: "invert(1)",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: PRIMARY,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  searchWrapper: {
    width: "100%",
    position: "relative",
  },
  searchInp: {
    height: 48,
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 72,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  searchBtn: {
    width: 52,
    height: 38,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    position: "absolute",
    top: 5,
    right: 5,
  },
  searchImg: {
    width: 22,
    height: 22,
    filter: "invert(1)",
  },
});
