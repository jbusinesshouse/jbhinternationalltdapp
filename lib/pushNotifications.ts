import { apiRequest } from "@/lib/api";
import { isRunningInExpoGo } from "expo";
import * as Device from "expo-device";
import { Linking, Platform } from "react-native";

/**
 * expo-notifications throws on import in Expo Go (SDK 53+ Android).
 * Only load it in real native builds (dev client / production).
 */
type NotificationsModule = typeof import("expo-notifications");

let Notifications: NotificationsModule | null = null;

function getNotifications(): NotificationsModule | null {
  if (Platform.OS === "web" || isRunningInExpoGo()) return null;
  if (Notifications) return Notifications;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require("expo-notifications") as NotificationsModule;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    return Notifications;
  } catch (err) {
    if (__DEV__) {
      console.warn("[push] expo-notifications unavailable:", err);
    }
    return null;
  }
}

let cachedToken: string | null = null;

export type NotificationPermissionState =
  | "granted"
  | "denied"
  | "undetermined"
  | "unavailable";

/** Matches app.json → expo.extra.eas.projectId */
const EAS_PROJECT_ID = "c24f9ee5-c2bd-4c72-ac16-b9a3c995a78c";

function getEasProjectId(): string | undefined {
  return EAS_PROJECT_ID;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionState> {
  const N = getNotifications();
  if (!N || !Device.isDevice) return "unavailable";

  const current = await N.getPermissionsAsync();
  if (current.status === "granted") return "granted";
  if (current.status === "denied") return "denied";
  return "undetermined";
}

async function ensureAndroidChannel() {
  const N = getNotifications();
  if (!N || Platform.OS !== "android") return;
  await N.setNotificationChannelAsync("default", {
    name: "Orders & updates",
    importance: N.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#f5832b",
  });
}

/**
 * Ask permission (optional), create Android channel, return Expo push token.
 * Pass requestPermission=false to only proceed when already granted.
 */
export async function getExpoPushToken(options?: {
  requestPermission?: boolean;
}): Promise<string | null> {
  const requestPermission = options?.requestPermission !== false;
  const N = getNotifications();

  if (!N) return null;
  if (!Device.isDevice) {
    if (__DEV__) {
      console.warn("[push] Push requires a physical device");
    }
    return null;
  }

  await ensureAndroidChannel();

  const current = await N.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    if (!requestPermission) return null;
    const asked = await N.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== "granted") {
    if (__DEV__) {
      console.warn("[push] Permission not granted");
    }
    return null;
  }

  const projectId = getEasProjectId();
  if (!projectId) {
    if (__DEV__) {
      console.warn("[push] Missing EAS projectId");
    }
    return null;
  }

  const tokenResult = await N.getExpoPushTokenAsync({ projectId });
  cachedToken = tokenResult.data;
  return cachedToken;
}

export async function registerPushTokenWithBackend(options?: {
  requestPermission?: boolean;
}): Promise<string | null> {
  try {
    const token = await getExpoPushToken(options);
    if (!token) return null;

    await apiRequest("/push-tokens", {
      method: "POST",
      body: {
        expoPushToken: token,
        platform: Platform.OS === "ios" ? "ios" : "android",
        deviceName: Device.modelName ?? Device.deviceName ?? null,
      },
    });

    return token;
  } catch (err) {
    if (__DEV__) {
      console.warn("[push] register failed:", err);
    }
    return null;
  }
}

/**
 * Profile/settings flow: request permission if needed, then register token.
 * Returns the resulting permission state.
 */
export async function enablePushNotificationsFromSettings(): Promise<{
  status: NotificationPermissionState;
  token: string | null;
}> {
  if (!getNotifications() || !Device.isDevice) {
    return { status: "unavailable", token: null };
  }

  const before = await getNotificationPermissionStatus();
  if (before === "denied") {
    return { status: "denied", token: null };
  }

  const token = await registerPushTokenWithBackend({ requestPermission: true });
  const after = await getNotificationPermissionStatus();
  return { status: after, token };
}

export async function openSystemNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (err) {
    if (__DEV__) {
      console.warn("[push] openSettings failed:", err);
    }
  }
}

export async function unregisterPushTokenFromBackend(): Promise<void> {
  const token = cachedToken;
  if (!token) return;
  try {
    await apiRequest(`/push-tokens?token=${encodeURIComponent(token)}`, {
      method: "DELETE",
    });
  } catch (err) {
    if (__DEV__) {
      console.warn("[push] unregister failed:", err);
    }
  } finally {
    cachedToken = null;
  }
}

export type PushNavData = {
  type?: string;
  orderId?: string | null;
};

export function parsePushData(
  data: Record<string, unknown> | undefined
): PushNavData {
  if (!data) return {};
  const type = typeof data.type === "string" ? data.type : undefined;
  const orderId =
    typeof data.orderId === "string"
      ? data.orderId
      : typeof data.order_id === "string"
        ? data.order_id
        : null;
  return { type, orderId };
}

/** Subscribe to notification taps. No-op in Expo Go / web. */
export function addNotificationResponseListener(
  listener: (data: Record<string, unknown> | undefined) => void
): { remove: () => void } {
  const N = getNotifications();
  if (!N) return { remove: () => {} };

  const sub = N.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as
      | Record<string, unknown>
      | undefined;
    listener(data);
  });
  return sub;
}

export async function getLastNotificationResponseData(): Promise<
  Record<string, unknown> | undefined
> {
  const N = getNotifications();
  if (!N) return undefined;
  const response = await N.getLastNotificationResponseAsync();
  if (!response) return undefined;
  return response.notification.request.content.data as
    | Record<string, unknown>
    | undefined;
}
