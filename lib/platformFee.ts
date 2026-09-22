import { apiRequest, newIdempotencyKey } from "@/lib/api";

/** 2% of completed sales */
export const PLATFORM_FEE_RATE = 0.02;
/** Max outstanding due shown / expected in one go */
export const PLATFORM_FEE_MAX_DUE = 1000;
/** Yellow warning threshold on outstanding */
export const PLATFORM_FEE_WARN_AT = 800;

/**
 * Personal bKash number sellers Send Money to.
 * Server may override via summary.bkashNumber.
 */
export const PLATFORM_BKASH_NUMBER = "01950863414";

/** @deprecated use PLATFORM_BKASH_NUMBER */
export const PLATFORM_BKASH_MERCHANT = PLATFORM_BKASH_NUMBER;

export type PlatformFeePaymentStatus = "pending" | "approved" | "rejected";

export type PlatformFeePayment = {
  id: string;
  seller_id: string;
  amount_bdt: number;
  bkash_number: string;
  transaction_reference: string;
  status: PlatformFeePaymentStatus;
  created_at: string;
  admin_note: string | null;
};

export type PlatformFeeSummary = {
  salesTotal: number;
  feeFromSales: number;
  approvedPaid: number;
  pendingPaid: number;
  balance: number;
  outstanding: number;
  deferredBeyondCap: number;
  pendingPayment: PlatformFeePayment | null;
  recentPayments: PlatformFeePayment[];
  bkashNumber?: string;
  rate?: number;
  maxDue?: number;
  warnAt?: number;
};

export type FeeAlertLevel = "ok" | "warn" | "critical" | "clear";

export function getFeeAlertLevel(outstanding: number): FeeAlertLevel {
  if (outstanding <= 0) return "clear";
  if (outstanding >= PLATFORM_FEE_MAX_DUE) return "critical";
  if (outstanding >= PLATFORM_FEE_WARN_AT) return "warn";
  return "ok";
}

export function getFeeDueAlertCopy(summary: {
  outstanding: number;
  deferredBeyondCap?: number;
}): { level: "warn" | "critical"; title: string; body: string } | null {
  const level = getFeeAlertLevel(summary.outstanding);
  if (level !== "warn" && level !== "critical") return null;

  if (level === "critical") {
    const extra =
      (summary.deferredBeyondCap ?? 0) > 0
        ? ` এছাড়াও আরও ${formatBdt(summary.deferredBeyondCap!)} ফি জমে আছে।`
        : "";
    return {
      level,
      title: "জরুরি: প্ল্যাটফর্ম ফি বকেয়া",
      body: `আপনার বকেয়া ${formatBdt(summary.outstanding)} (সর্বোচ্চ সীমা ${formatBdt(PLATFORM_FEE_MAX_DUE)})। দয়া করে দ্রুত Hub থেকে bKash-এ পরিশোধ করুন।${extra}`,
    };
  }

  return {
    level,
    title: "সতর্কতা: পেমেন্ট শীঘ্রই বাকি",
    body: `আপনার বকেয়া ${formatBdt(summary.outstanding)}। ${formatBdt(PLATFORM_FEE_WARN_AT)} ছুঁয়ে গেছে — সীমা ${formatBdt(PLATFORM_FEE_MAX_DUE)} এর আগে Hub থেকে পরিশোধ করুন।`,
  };
}

export function formatBdt(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const asInt = Math.abs(rounded - Math.round(rounded)) < 0.001;
  const n = asInt ? Math.round(rounded) : rounded;
  return `৳${n.toLocaleString("en-BD", {
    maximumFractionDigits: asInt ? 0 : 2,
  })}`;
}

export async function fetchPlatformFeeSummary(
  _sellerId?: string
): Promise<PlatformFeeSummary> {
  const summary = await apiRequest<PlatformFeeSummary>("/platform-fee/summary");
  return {
    ...summary,
    recentPayments: (summary.recentPayments ?? []).map((row) => ({
      ...row,
      amount_bdt: Number(row.amount_bdt) || 0,
    })),
    pendingPayment: summary.pendingPayment
      ? {
          ...summary.pendingPayment,
          amount_bdt: Number(summary.pendingPayment.amount_bdt) || 0,
        }
      : null,
  };
}

export async function submitPlatformFeePayment(params: {
  sellerId?: string;
  amountBdt: number;
  bkashNumber: string;
  transactionReference: string;
  salesTotalSnapshot: number;
  feeFromSalesSnapshot: number;
  feeDueSnapshot: number;
  approvedPaidSnapshot: number;
}): Promise<void> {
  if (!(params.amountBdt > 0)) {
    throw new Error("Invalid amount");
  }

  await apiRequest("/platform-fee/payments", {
    method: "POST",
    body: {
      amountBdt: params.amountBdt,
      bkashNumber: params.bkashNumber.trim(),
      transactionReference: params.transactionReference.trim(),
      salesTotalSnapshot: params.salesTotalSnapshot,
      feeFromSalesSnapshot: params.feeFromSalesSnapshot,
      feeDueSnapshot: params.feeDueSnapshot,
      approvedPaidSnapshot: params.approvedPaidSnapshot,
    },
    idempotencyKey: newIdempotencyKey(),
  });
}
