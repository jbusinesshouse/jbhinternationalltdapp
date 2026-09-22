import { apiRequest } from "@/lib/api";

export type SellerUploadEligibility = {
  allowed: boolean;
  reason?: string;
  storeType?: string | null;
  status?: string | null;
};

/**
 * Fresh server check before product writes.
 * Real enforcement is on the Express BFF / RLS — this improves UX.
 */
export async function fetchSellerUploadEligibility(
  _userId?: string
): Promise<SellerUploadEligibility> {
  try {
    return await apiRequest<SellerUploadEligibility>(
      "/profiles/me/upload-eligibility"
    );
  } catch (err: any) {
    if (err?.status === 401) {
      return { allowed: false, reason: "প্রোডাক্ট আপলোড করতে সাইন ইন করুন।" };
    }
    return {
      allowed: false,
      reason: "প্রোফাইল লোড করা যায়নি। একটু পর আবার চেষ্টা করুন।",
    };
  }
}
