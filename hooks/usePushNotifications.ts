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
import { AppState, Platform } from "react-native";

function navigateFromPush(data: Record<string, unknown> | undefined) {
  const { type, orderId, roomId } = parsePushData(data);

  if (type === "chat_message" && roomId) {
    router.push({
      pathname: "/messages/[id]",
      params: { id: roomId },
    });
    return;
  }

  if (type === "chat_message") {
    router.push("/(tabs)/messages");
    return;
  }

  if (!orderId) {
    router.push("/notifications");
    return;
  }

  if (
    type === "order_received" ||
    type === "order_cancel_response" ||
    type === "product_review"
  ) {
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

    const syncToken = () => {
      if (!user) {
        void unregisterPushTokenFromBackend();
        return;
      }
      // Only register when already granted — do not pop the system prompt here.
      // Runs again when the app returns to the foreground, so turning notifications
      // on in system Settings still saves the device token.
      void registerPushTokenWithBackend({ requestPermission: false });
    };

    syncToken();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") syncToken();
    });

    return () => sub.remove();
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
