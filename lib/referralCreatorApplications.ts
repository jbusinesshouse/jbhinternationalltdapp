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

/** Latest application for the current user (any status). */
export async function fetchMyLatestReferralCreatorApplication(
  userId: string
): Promise<ReferralCreatorApplication | null> {
  const { data, error } = await supabase
    .from("referral_creator_applications")
    .select(
      "id, user_id, full_name, phone, platform, profile_url, follower_count, message, status, created_at"
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
