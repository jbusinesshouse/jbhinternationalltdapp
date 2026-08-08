import { supabase } from "@/lib/supabase";

/** 2% of completed sales */
export const PLATFORM_FEE_RATE = 0.02;
/** Max outstanding due shown / expected in one go */
export const PLATFORM_FEE_MAX_DUE = 1000;
/** Yellow warning threshold on outstanding */
export const PLATFORM_FEE_WARN_AT = 800;

/**
 * Personal bKash number sellers Send Money to.
 * Replace with your real number before production.
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

/**
 * Tracking model:
 * - feeFromSales  = completed_sales × 2%   (fee added from seller sales)
 * - approvedPaid  = sum of approved proofs
 * - pendingPaid   = sum of pending proofs (not counted as paid yet)
 * - balance       = feeFromSales − approvedPaid
 * - outstanding   = min(max(balance, 0), 1000)  (what they should pay now)
 */
export type PlatformFeeSummary = {
  salesTotal: number;
  /** 2% of completed sales — fee generated from sales */
  feeFromSales: number;
  /** Approved bKash proofs total */
  approvedPaid: number;
  /** Pending proofs (awaiting manual review) */
  pendingPaid: number;
  /** feeFromSales − approvedPaid (can exceed the 1000 cap) */
  balance: number;
  /** Amount due now (capped at 1000) */
  outstanding: number;
  /** How much of feeFromSales is above the current due cap */
  deferredBeyondCap: number;
  pendingPayment: PlatformFeePayment | null;
  recentPayments: PlatformFeePayment[];
};

export type FeeAlertLevel = "ok" | "warn" | "critical" | "clear";

export function getFeeAlertLevel(outstanding: number): FeeAlertLevel {
  if (outstanding <= 0) return "clear";
  if (outstanding >= PLATFORM_FEE_MAX_DUE) return "critical";
  if (outstanding >= PLATFORM_FEE_WARN_AT) return "warn";
  return "ok";
}

/** Popup / banner copy when due is near or at the 1000 BDT cap. */
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

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Sum completed order line totals for the seller's products.
 */
export async function fetchSellerCompletedSalesTotal(
  sellerId: string
): Promise<number> {
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("seller_id", sellerId);

  if (productError) throw productError;
  if (!products?.length) return 0;

  const productIds = products.map((p) => p.id);

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      order_items (
        quantity,
        price_snapshot
      )
    `
    )
    .in("product_id", productIds)
    .eq("status", "completed");

  if (ordersError) throw ordersError;

  let total = 0;
  for (const order of orders ?? []) {
    const items = (order as any).order_items ?? [];
    for (const item of items) {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price_snapshot) || 0;
      total += qty * price;
    }
  }

  return roundMoney(total);
}

export async function fetchMyPlatformFeePayments(
  sellerId: string
): Promise<PlatformFeePayment[]> {
  const { data, error } = await supabase
    .from("platform_fee_payments")
    .select(
      "id, seller_id, amount_bdt, bkash_number, transaction_reference, status, created_at, admin_note"
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;

  return ((data ?? []) as any[]).map((row) => ({
    ...row,
    amount_bdt: Number(row.amount_bdt) || 0,
  }));
}

export async function fetchPlatformFeeSummary(
  sellerId: string
): Promise<PlatformFeeSummary> {
  const [salesTotal, payments] = await Promise.all([
    fetchSellerCompletedSalesTotal(sellerId),
    fetchMyPlatformFeePayments(sellerId),
  ]);

  const feeFromSales = roundMoney(salesTotal * PLATFORM_FEE_RATE);
  const approvedPaid = roundMoney(
    payments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + p.amount_bdt, 0)
  );
  const pendingPaid = roundMoney(
    payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount_bdt, 0)
  );

  const balance = roundMoney(feeFromSales - approvedPaid);
  const outstanding = roundMoney(
    Math.min(Math.max(balance, 0), PLATFORM_FEE_MAX_DUE)
  );
  const deferredBeyondCap = roundMoney(Math.max(0, balance - outstanding));

  const pendingPayment =
    payments.find((p) => p.status === "pending") ?? null;

  return {
    salesTotal,
    feeFromSales,
    approvedPaid,
    pendingPaid,
    balance,
    outstanding,
    deferredBeyondCap,
    pendingPayment,
    recentPayments: payments,
  };
}

export async function submitPlatformFeePayment(params: {
  sellerId: string;
  amountBdt: number;
  bkashNumber: string;
  transactionReference: string;
  salesTotalSnapshot: number;
  feeFromSalesSnapshot: number;
  feeDueSnapshot: number;
  approvedPaidSnapshot: number;
}): Promise<void> {
  const {
    sellerId,
    amountBdt,
    bkashNumber,
    transactionReference,
    salesTotalSnapshot,
    feeFromSalesSnapshot,
    feeDueSnapshot,
    approvedPaidSnapshot,
  } = params;

  if (!(amountBdt > 0)) {
    throw new Error("Invalid amount");
  }

  const { error } = await supabase.from("platform_fee_payments").insert({
    seller_id: sellerId,
    amount_bdt: amountBdt,
    bkash_number: bkashNumber.trim(),
    transaction_reference: transactionReference.trim(),
    sales_total_snapshot: salesTotalSnapshot,
    fee_from_sales_snapshot: feeFromSalesSnapshot,
    fee_due_snapshot: feeDueSnapshot,
    approved_paid_snapshot: approvedPaidSnapshot,
    status: "pending",
  });

  if (error) throw error;
}
