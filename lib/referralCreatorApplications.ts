import { apiRequest } from "@/lib/api";

export type ReferralCreatorPlatform =
  | "facebook"
  | "youtube"
  | "tiktok"
  | "instagram"
  | "other";

export type ReferralCreatorApplicationStatus =
  | "pending"
  | "approved"
  | "rejected";

export type ReferralCreatorApplication = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  platform: ReferralCreatorPlatform;
  profile_url: string;
  follower_count: string | null;
  message: string | null;
  status: ReferralCreatorApplicationStatus;
  referral_creator_id: string | null;
  created_at: string;
};

export type SubmitReferralCreatorApplicationInput = {
  userId?: string;
  fullName: string;
  phone: string;
  platform: ReferralCreatorPlatform;
  profileUrl: string;
  followerCount: string | null;
  message: string | null;
};

export type MyReferralCreator = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
};

export type ReferralSignup = {
  id: string;
  display_name: string;
  store_type: string | null;
  joined_at: string;
};

export type MyReferralDashboard = {
  creator: MyReferralCreator;
  totalSignups: number;
  signups: ReferralSignup[];
};

/** Latest application for the current user. */
export async function fetchMyLatestReferralCreatorApplication(
  _userId?: string
): Promise<ReferralCreatorApplication | null> {
  const res = await apiRequest<{ application: ReferralCreatorApplication | null }>(
    "/referral/applications/latest"
  );
  return res.application ?? null;
}

export async function submitReferralCreatorApplication(
  input: SubmitReferralCreatorApplicationInput
): Promise<void> {
  await apiRequest("/referral/applications", {
    method: "POST",
    body: {
      fullName: input.fullName,
      phone: input.phone,
      platform: input.platform,
      profileUrl: input.profileUrl,
      followerCount: input.followerCount,
      message: input.message,
    },
  });
}

export async function validateReferralCode(
  code: string
): Promise<{ creatorId: string | null; valid: boolean }> {
  const trimmed = code.trim();
  if (!trimmed) return { creatorId: null, valid: false };
  return apiRequest(`/referral/validate/${encodeURIComponent(trimmed)}`, {
    auth: false,
  });
}

/** Dashboard for approved creators (null if not a creator). */
export async function fetchMyReferralDashboard(
  _userId?: string
): Promise<MyReferralDashboard | null> {
  const res = await apiRequest<{ dashboard: MyReferralDashboard | null }>(
    "/referral/dashboard"
  );
  return res.dashboard ?? null;
}

/** @deprecated use fetchMyReferralDashboard */
export async function fetchMyReferralCreator(
  userId?: string
): Promise<MyReferralCreator | null> {
  const dash = await fetchMyReferralDashboard(userId);
  return dash?.creator ?? null;
}

/** @deprecated use fetchMyReferralDashboard */
export async function fetchMyReferralSignups(): Promise<ReferralSignup[]> {
  const dash = await fetchMyReferralDashboard();
  return dash?.signups ?? [];
}

export function storeTypeLabel(storeType: string | null | undefined): string {
  if (storeType === "wholesale") return "হোলসেল বিক্রেতা";
  if (storeType === "retail") return "খুচরা বিক্রেতা";
  return "ইউজার";
}

export function formatCompactJoinDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}
