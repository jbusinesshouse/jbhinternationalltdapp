import { showAppAlert } from "@/context/AppAlertContext";
import { useProfile } from "@/hooks/useProfile";
import {
  fetchPlatformFeeSummary,
  getFeeDueAlertCopy,
} from "@/lib/platformFee";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

/**
 * Shows a one-time-per-session branded alert when a wholesale seller's
 * platform fee due is near or at the max (warn / critical).
 */
export default function usePlatformFeeDueAlert() {
  const { profile, loading } = useProfile();
  const shownRef = useRef(false);

  useEffect(() => {
    if (loading || !profile || shownRef.current) return;
    if (profile.store_type !== "wholesale") return;

    let cancelled = false;

    const run = async () => {
      try {
        const summary = await fetchPlatformFeeSummary(profile.id);
        if (cancelled || shownRef.current) return;

        const copy = getFeeDueAlertCopy(summary);
        if (!copy) return;

        shownRef.current = true;
        showAppAlert(copy.title, copy.body, [
          { text: "পরে", style: "cancel" },
          {
            text: "Hub এ যান",
            onPress: () => router.push("/(tabs)/hub"),
          },
        ]);
      } catch (err) {
        if (__DEV__) {
          console.warn("[usePlatformFeeDueAlert] failed:", err);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [loading, profile]);
}
