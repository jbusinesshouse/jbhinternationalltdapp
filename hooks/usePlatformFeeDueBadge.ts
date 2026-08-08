import { useProfile } from "@/hooks/useProfile";
import {
  fetchPlatformFeeSummary,
  getFeeAlertLevel,
} from "@/lib/platformFee";
import { useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

/**
 * True when a wholesale seller's platform fee due is warn/critical
 * (near or at the max due). Used for the Hub tab badge.
 */
export function usePlatformFeeDueBadge() {
  const { profile, loading } = useProfile();
  const [needsAction, setNeedsAction] = useState(false);

  const refresh = useCallback(async () => {
    if (!profile || profile.store_type !== "wholesale") {
      setNeedsAction(false);
      return;
    }
    try {
      const summary = await fetchPlatformFeeSummary(profile.id);
      const level = getFeeAlertLevel(summary.outstanding);
      setNeedsAction(level === "warn" || level === "critical");
    } catch {
      /* keep previous badge state */
    }
  }, [profile]);

  useEffect(() => {
    if (loading) return;
    refresh();
  }, [loading, refresh]);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === "active") refresh();
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [refresh]);

  return needsAction;
}
