import { supabase } from "@/lib/supabase";

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
  userId: string;
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

/** Latest application for the current user (any status). */
export async function fetchMyLatestReferralCreatorApplication(
  userId: string
): Promise<ReferralCreatorApplication | null> {
  const { data, error } = await supabase
    .from("referral_creator_applications")
    .select(
      "id, user_id, full_name, phone, platform, profile_url, follower_count, message, status, referral_creator_id, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as ReferralCreatorApplication | null) ?? null;
}

export async function submitReferralCreatorApplication(
  input: SubmitReferralCreatorApplicationInput
): Promise<void> {
  const { error } = await supabase.from("referral_creator_applications").insert({
    user_id: input.userId,
    full_name: input.fullName,
    phone: input.phone,
    platform: input.platform,
    profile_url: input.profileUrl,
    follower_count: input.followerCount,
    message: input.message,
    status: "pending",
  });

  if (error) throw error;
}

/** Own referral_creators row (RLS: user_id = auth.uid()). */
export async function fetchMyReferralCreator(
  userId: string
): Promise<MyReferralCreator | null> {
  const { data, error } = await supabase
    .from("referral_creators")
    .select("id, name, code, active, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as MyReferralCreator | null) ?? null;
}

/** Limited referred-user list via SECURITY DEFINER RPC. */
export async function fetchMyReferralSignups(): Promise<ReferralSignup[]> {
  const { data, error } = await supabase.rpc("get_my_referral_signups");

  if (error) throw error;

  return ((data as ReferralSignup[] | null) ?? []).map((row) => ({
    id: row.id,
    display_name: row.display_name || "ইউজার",
    store_type: row.store_type ?? null,
    joined_at: row.joined_at,
  }));
}

/** Creator summary + compact signup list for the dashboard. */
export async function fetchMyReferralDashboard(
  userId: string
): Promise<MyReferralDashboard | null> {
  const creator = await fetchMyReferralCreator(userId);
  if (!creator) return null;

  const signups = await fetchMyReferralSignups();

  return {
    creator,
    totalSignups: signups.length,
    signups,
  };
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
