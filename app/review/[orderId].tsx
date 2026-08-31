import ConfirmModal from "@/components/modal/ConfirmModal";
import { showAppAlert } from "@/context/AppAlertContext";
import {
  MAX_REVIEW_IMAGES,
  getReviewEligibility,
  submitProductReview,
} from "@/lib/productReviews";
import {
  deleteLocalImageUris,
  formatImageProcessingError,
  formatUploadError,
  isPreparedImageUri,
  preparePickedProductImages,
} from "@/lib/pickedImage";
import { supabase } from "@/lib/supabase";
import { styles } from "@/styles/support";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const WriteReview = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [pickingImages, setPickingImages] = useState(false);
  const localImageUrisRef = useRef<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadEligibility = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const eligibility = await getReviewEligibility(orderId, user.id);
      setCanReview(eligibility.canReview);
      setAlreadyReviewed(eligibility.alreadyReviewed);
      setProductId(eligibility.productId);
      setSellerId(eligibility.sellerId);
      setProductName(eligibility.productName);
      setBlockReason(eligibility.reason ?? null);
    } catch (err: any) {
      if (__DEV__) {
        console.warn("[WriteReview] load failed:", err);
      }
      showAppAlert(
        "সমস্যা",
        err?.message || "রিভিউ ফর্ম লোড করা যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadEligibility();
  }, [loadEligibility]);

  useEffect(() => {
    localImageUrisRef.current = images.filter((uri) => isPreparedImageUri(uri));
  }, [images]);

  useEffect(() => {
    return () => {
      void deleteLocalImageUris(localImageUrisRef.current);
    };
  }, []);

  const pickImages = async () => {
    if (pickingImages || submitting) return;

    const remaining = MAX_REVIEW_IMAGES - images.length;
    if (remaining <= 0) {
      showAppAlert(
        "সীমা পূর্ণ",
        `আপনি সর্বোচ্চ ${MAX_REVIEW_IMAGES}টি ছবি আপলোড করতে পারবেন।`
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: remaining,
    });

    if (result.canceled) return;

    setPickingImages(true);
    try {
      const prepared = await preparePickedProductImages(
        result.assets.map((asset) => asset.uri)
      );
      setImages((prev) =>
        [...prev, ...prepared.map((image) => image.uri)].slice(
          0,
          MAX_REVIEW_IMAGES
        )
      );
    } catch (error) {
      showAppAlert("সমস্যা", formatImageProcessingError(error));
    } finally {
      setPickingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const uri = images[index];
    if (uri && isPreparedImageUri(uri)) {
      void deleteLocalImageUris([uri]);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const markReviewNotificationDone = async (userId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ action_completed: true, is_read: true })
        .eq("order_id", orderId)
        .eq("user_id", userId)
        .eq("type", "order_review_request");
    } catch (err) {
      if (__DEV__) {
        console.warn("[WriteReview] mark notification failed:", err);
      }
    }
  };

  const notifySellerOfReview = async () => {
    if (!sellerId || !orderId) return;

    try {
      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: "New product review",
          message: productName
            ? `A buyer left a ${rating}-star review on ${productName}.`
            : `A buyer left a ${rating}-star review on your product.`,
          type: "product_review",
          order_id: orderId,
          is_read: false,
        },
      ]);
    } catch (err) {
      if (__DEV__) {
        console.warn("[WriteReview] seller notify failed:", err);
      }
    }
  };

  const handleSubmit = async () => {
    if (!canReview || !orderId || !productId || !sellerId) return;

    if (rating < 1) {
      showAppAlert("রেটিং দিন", "অনুগ্রহ করে স্টার রেটিং বাছুন।");
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      await submitProductReview({
        orderId,
        productId,
        sellerId,
        buyerId: user.id,
        rating,
        comment: comment.trim() ? comment.trim() : null,
        imageUris: images,
      });

      await deleteLocalImageUris(images);
      setImages([]);

      await markReviewNotificationDone(user.id);
      await notifySellerOfReview();

      setShowSuccessModal(true);
    } catch (err: any) {
      if (__DEV__) {
        console.warn("[WriteReview] submit failed:", err);
      }
      showAppAlert(
        "সমস্যা",
        formatUploadError(err, "রিভিউ জমা দেওয়া যায়নি।")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/orders/${orderId}`);
    }
  };

  if (loading) {
    return (
      <View style={local.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f6f7fb" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("@/assets/images/icons/chevron-right.png")}
            style={styles.backIcon}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {productName ? (
          <Text style={styles.paragraph}>
            How was <Text style={{ fontWeight: "700" }}>{productName}</Text>?
          </Text>
        ) : (
          <Text style={styles.paragraph}>
            Share your experience with this product.
          </Text>
        )}

        {!canReview ? (
          <View style={local.blockedBox}>
            <Text style={local.blockedText}>
              {alreadyReviewed
                ? "You already reviewed this order."
                : blockReason || "You cannot review this order right now."}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.inputLabel}>Your rating</Text>
            <View style={local.starsRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setRating(value)}
                  hitSlop={8}
                >
                  <Image
                    source={require("@/assets/images/icons/star.png")}
                    style={[
                      local.star,
                      { opacity: value <= rating ? 1 : 0.25 },
                    ]}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Comment (optional)</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Tell others what you liked or what could be better..."
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
            />

            <Text style={styles.inputLabel}>
              Photos (optional, max {MAX_REVIEW_IMAGES})
            </Text>

            <View style={local.imagesRow}>
              {images.map((uri, index) => (
                <View key={`${uri}-${index}`} style={local.imageWrap}>
                  <Image source={{ uri }} style={local.thumb} />
                  <Pressable
                    style={local.removeBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={local.removeBtnText}>×</Text>
                  </Pressable>
                </View>
              ))}

              {images.length < MAX_REVIEW_IMAGES && (
                <Pressable
                  style={local.addImageBtn}
                  onPress={pickImages}
                  disabled={pickingImages || submitting}
                >
                  <Text style={local.addImageText}>
                    {pickingImages ? "..." : "+"}
                  </Text>
                  <Text style={local.addImageHint}>
                    {pickingImages ? "Preparing" : "Add"}
                  </Text>
                </Pressable>
              )}
            </View>

            <Pressable
              style={[
                styles.submitBtn,
                (submitting || rating < 1) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || rating < 1}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <ConfirmModal
        visible={showSuccessModal}
        title="রিভিউ জমা হয়েছে"
        description="ধন্যবাদ! আপনার রিভিউ অন্য ক্রেতাদের সাহায্য করবে।"
        confirmText="ঠিক আছে"
        cancelText={null}
        onConfirm={handleSuccessClose}
      />
    </KeyboardAvoidingView>
  );
};

const local = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f7fb",
  },
  starsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  star: {
    width: 32,
    height: 32,
  },
  imagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  imageWrap: {
    position: "relative",
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  addImageBtn: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  addImageText: {
    fontSize: 22,
    color: "#666",
    lineHeight: 24,
  },
  addImageHint: {
    fontSize: 11,
    color: "#888",
  },
  blockedBox: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  blockedText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default WriteReview;
