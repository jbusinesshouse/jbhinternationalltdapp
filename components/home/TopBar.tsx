import { useUser } from "@/context/UserContext";
import type { HomeMode } from "@/hooks/useCatalogPrefs";
import { fetchUnreadNotificationCount } from "@/lib/catalogApi";
import { goToSignIn } from "@/lib/guestAuth";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY = "#f5832b";

const TABS: { key: HomeMode; label: string }[] = [
  { key: "products", label: "Products" },
  { key: "manufacturers", label: "Manufacturers" },
];

type TopBarProps = {
  activeMode?: HomeMode;
  onModeChange?: (mode: HomeMode) => void;
};

/**
 * JBH home header: Products / Manufacturers mode tabs + search.
 * Keeps black brand chrome from the existing app.
 */
const TopBar = ({
  activeMode = "products",
  onModeChange,
}: TopBarProps) => {
  const { user, loading: authLoading } = useUser();
  const [searchVal, setSearchVal] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const active = activeMode === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onModeChange?.(tab.key)}
                style={styles.tabBtn}
                hitSlop={4}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {active ? <View style={styles.tabUnderline} /> : null}
              </Pressable>
            );
          })}
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
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  tabBtn: {
    paddingBottom: 8,
    position: "relative",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.65)",
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
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
