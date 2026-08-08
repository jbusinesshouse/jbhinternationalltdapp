import ConfirmModal from "@/components/modal/ConfirmModal";
import SingleProduct from "@/components/SingleProduct";
import StoreProductSearch, {
  useStoreProductSearch,
} from "@/components/StoreProductSearch";
import { showAppAlert } from "@/context/AppAlertContext";
import { supabase } from "@/lib/supabase";
import { styles as sharedStyles } from "@/styles/profile";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  store_name: string;
  store_type: string;
  phone: string | null;
  district: string | null;
  upazila: string | null;
  address: string | null;
};

type StoreProduct = {
  id: string;
  name: string;
  price: number | string;
  moq: number;
  productImg: string | null;
};

const PublicProfile = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const { query, setQuery, filtered: filteredProducts } =
    useStoreProductSearch(products);

  const handleBlockUser = () => {
    setMenuVisible(false);
    setShowBlockModal(true);
  };

  const handleReportUser = () => {
    setMenuVisible(false);
    router.push({
      pathname: "/report/[id]",
      params: { id: id as string, type: "profile" },
    });
  };

  const fetchProducts = useCallback(async (sellerId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        price,
        moq,
        product_images (
          image_url,
          is_main
        )
      `
      )
      .eq("seller_id", sellerId)
      .eq("is_deleted", false)
      .eq("status", "active");

    if (error) {
      if (__DEV__) console.log("PRODUCT ERROR:", error);
      return;
    }

    const formatted: StoreProduct[] = (data ?? []).map((item: any) => {
      const mainImage = item.product_images?.find(
        (img: { is_main: boolean }) => img.is_main === true
      );
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        moq: item.moq ?? 0,
        productImg: mainImage?.image_url ?? item.product_images?.[0]?.image_url ?? null,
      };
    });

    setProducts(formatted);
  }, []);

  const fetchProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, store_name, store_type, phone, district, upazila, address"
      )
      .eq("id", id)
      .single();

    if (error) {
      if (__DEV__) console.log("PROFILE ERROR:", error);
      setLoading(false);
      return;
    }

    setProfile(data);
    if (data?.store_type === "wholesale") {
      await fetchProducts(data.id);
    }
    setLoading(false);
  }, [id, fetchProducts]);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id, fetchProfile]);

  const locationLine = useMemo(() => {
    if (!profile) return null;
    const parts = [profile.upazila, profile.district].filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }, [profile]);

  const listHeader = useMemo(() => {
    if (!profile) return null;

    const isWholesale = profile.store_type === "wholesale";

    return (
      <View>
        {/* Compact store identity */}
        <View style={s.storeHeader}>
          <Image
            source={
              profile.avatar_url
                ? { uri: profile.avatar_url }
                : require("@/assets/images/store1.jpg")
            }
            style={s.avatar}
          />
          <View style={s.storeMeta}>
            <Text style={s.storeName} numberOfLines={2}>
              {profile.store_name || "Store"}
            </Text>
            {locationLine ? (
              <Text style={s.location} numberOfLines={1}>
                {locationLine}
              </Text>
            ) : null}
            {isWholesale ? (
              <Text style={s.productCount}>
                {query.trim()
                  ? `${filteredProducts.length} of ${products.length}`
                  : products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Secondary details — collapsed by default */}
        <Pressable
          style={s.detailsToggle}
          onPress={() => setDetailsOpen((open) => !open)}
        >
          <Text style={s.detailsToggleText}>
            {detailsOpen ? "Hide store details" : "Store details"}
          </Text>
          <Image
            source={require("@/assets/images/icons/chevron-right.png")}
            style={[
              s.detailsChevron,
              detailsOpen && s.detailsChevronOpen,
            ]}
          />
        </Pressable>

        {detailsOpen ? (
          <View style={s.detailsBody}>
            {profile.phone ? (
              <Text style={s.detailLine}>Phone: {profile.phone}</Text>
            ) : null}
            {profile.address ? (
              <Text style={s.detailLine}>Address: {profile.address}</Text>
            ) : null}
            {locationLine ? (
              <Text style={s.detailLine}>Area: {locationLine}</Text>
            ) : null}
            {!profile.phone && !profile.address && !locationLine ? (
              <Text style={s.detailLine}>No extra details available</Text>
            ) : null}
          </View>
        ) : null}

        {isWholesale ? (
          <>
            <Text style={s.catalogHeading}>Products</Text>
            {products.length > 0 ? (
              <StoreProductSearch
                value={query}
                onChangeText={setQuery}
                placeholder="Search products in this store"
                resultCount={filteredProducts.length}
                totalCount={products.length}
              />
            ) : null}
          </>
        ) : (
          <Text style={s.emptyCatalog}>
            This store does not list wholesale products
          </Text>
        )}
      </View>
    );
  }, [
    profile,
    locationLine,
    products.length,
    detailsOpen,
    query,
    filteredProducts.length,
  ]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#f5832b" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={s.center}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  const isWholesale = profile.store_type === "wholesale";

  return (
    <View style={s.container}>
      {/* Top bar */}
      <View style={sharedStyles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Image
            source={require("@/assets/images/icons/chevron-right.png")}
            style={sharedStyles.backIcon}
          />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>
          {profile.store_name || "Store"}
        </Text>
        <Pressable onPress={() => setMenuVisible(true)} hitSlop={8}>
          <Image
            source={require("@/assets/images/icons/dots.png")}
            style={s.moreIcon}
          />
        </Pressable>
      </View>

      {/* Overflow menu */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={s.menuContainer}>
            <Pressable style={s.menuItem} onPress={handleBlockUser}>
              <Text style={{ color: "red", fontWeight: "500" }}>ইউজার ব্লক</Text>
            </Pressable>
            <View style={{ height: 1, backgroundColor: "#eee" }} />
            <Pressable style={s.menuItem} onPress={handleReportUser}>
              <Text style={{ fontWeight: "500" }}>রিপোর্ট করুন</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {isWholesale ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={s.productRow}
          contentContainerStyle={s.listContent}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <Text style={s.emptyCatalog}>
              {products.length === 0
                ? "No products listed yet"
                : "No products match your search"}
            </Text>
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <SingleProduct
              productImg={
                item.productImg
                  ? { uri: item.productImg }
                  : require("@/assets/images/product1.png")
              }
              title={item.name}
              price={String(item.price)}
              moq={item.moq}
              productId={item.id}
            />
          )}
        />
      ) : (
        <View style={s.listContent}>{listHeader}</View>
      )}

      <ConfirmModal
        visible={showBlockModal}
        title="ইউজার ব্লক"
        description={`আপনি কি ${profile.store_name || profile.full_name} কে ব্লক করতে চান?`}
        confirmText="ব্লক"
        cancelText="বাতিল"
        danger
        onCancel={() => setShowBlockModal(false)}
        onConfirm={async () => {
          setShowBlockModal(false);

          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
              showAppAlert("সাইন ইন প্রয়োজন", "ইউজার ব্লক করতে সাইন ইন করুন।");
              return;
            }

            const { error } = await supabase.from("blocks").insert({
              blocker_id: user.id,
              blocked_id: id,
            });

            if (error) {
              if (error.code === "23505") {
                showAppAlert(
                  "ইতিমধ্যে ব্লক",
                  "আপনি এই ইউজারকে আগেই ব্লক করেছেন।"
                );
              } else {
                throw error;
              }
            } else {
              showAppAlert(
                "ব্লক হয়েছে",
                "ইউজারকে সফলভাবে ব্লক করা হয়েছে।",
                [{ text: "ঠিক আছে", onPress: () => navigation.goBack() }]
              );
            }
          } catch {
            showAppAlert("সমস্যা", "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
          }
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f7fb",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  moreIcon: {
    width: 20,
    height: 20,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 16,
    paddingBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e5e7eb",
  },
  storeMeta: {
    flex: 1,
    minWidth: 0,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  location: {
    marginTop: 3,
    fontSize: 13,
    color: "#6b7280",
  },
  productCount: {
    marginTop: 4,
    fontSize: 12,
    color: "#f5832b",
    fontWeight: "600",
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 4,
  },
  detailsToggleText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailsChevron: {
    width: 18,
    height: 18,
    opacity: 0.45,
    transform: [{ rotate: "90deg" }],
  },
  detailsChevronOpen: {
    transform: [{ rotate: "-90deg" }],
  },
  detailsBody: {
    paddingBottom: 12,
    gap: 4,
  },
  detailLine: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
  },
  catalogHeading: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
    color: "#111827",
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  emptyCatalog: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    color: "#777",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuContainer: {
    marginTop: 56,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: 150,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuItem: {
    padding: 12,
  },
});

export default PublicProfile;
