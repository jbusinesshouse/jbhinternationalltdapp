import { useUser } from "@/context/UserContext";
import {
  addNotificationResponseListener,
  getLastNotificationResponseData,
  parsePushData,
  registerPushTokenWithBackend,
  unregisterPushTokenFromBackend,
} from "@/lib/pushNotifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

function navigateFromPush(data: Record<string, unknown> | undefined) {
  const { type, orderId } = parsePushData(data);
  if (!orderId) {
    router.push("/notifications");
    return;
  }

  if (type === "order_received" || type === "order_cancel_response") {
    router.push(`/sales/${orderId}`);
    return;
  }

  if (type === "order_review_request") {
    router.push(`/review/${orderId}`);
    return;
  }

  if (
    type === "order_cancel_request" ||
    type === "order_placed" ||
    type === "order_processing" ||
    type === "order_shipped"
  ) {
    router.push(`/orders/${orderId}`);
    return;
  }

  router.push("/notifications");
}

/**
 * Registers Expo push token when signed in, cleans up on sign-out,
 * and opens the right screen when a notification is tapped.
 * No-op inside Expo Go (push requires a development build).
 */
export function usePushNotifications() {
  const { user, loading } = useUser();
  const responseSub = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (Platform.OS === "web") return;

    if (!user) {
      void unregisterPushTokenFromBackend();
      return;
    }

    void registerPushTokenWithBackend({ requestPermission: false });
  }, [user, loading]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    responseSub.current = addNotificationResponseListener((data) => {
      navigateFromPush(data);
    });

    void getLastNotificationResponseData().then((data) => {
      if (data) navigateFromPush(data);
    });

    return () => {
      responseSub.current?.remove();
      responseSub.current = null;
    };
  }, []);
}
