/** Mirrors backend/src/services/serviceCharge.ts — display fallback only; orders trust the server. */

export const SERVICE_CHARGE_RATE_WHOLESALE = 0.1;
export const SERVICE_CHARGE_RATE_RETAIL = 0.15;

export type SellerStoreType = "wholesale" | "retail" | string | null | undefined;

export type ServiceChargeBreakdown = {
  base: number;
  serviceCharge: number;
  inclusive: number;
  rate: number;
};

export function serviceChargeRateForSellerStoreType(storeType: SellerStoreType): number {
  if (storeType === "wholesale") return SERVICE_CHARGE_RATE_WHOLESALE;
  return SERVICE_CHARGE_RATE_RETAIL;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Inclusive (buyer) price → nearest whole BDT; serviceCharge derived so base + serviceCharge === inclusive. */
export function priceWithServiceCharge(base: number, rate: number): ServiceChargeBreakdown {
  const safeBase = roundMoney(Number(base) || 0);
  const safeRate = Number(rate) || 0;
  const inclusive = Math.round(safeBase * (1 + safeRate));
  const serviceCharge = roundMoney(inclusive - safeBase);
  return { base: safeBase, serviceCharge, inclusive, rate: safeRate };
}

/** Live hint under seller price field. */
export function buyerPriceServiceChargeHint(
  baseInput: string | number,
  storeType: SellerStoreType
): string | null {
  const base = typeof baseInput === "string" ? Number(baseInput) : baseInput;
  if (!Number.isFinite(base) || base <= 0) return null;
  const rate = serviceChargeRateForSellerStoreType(storeType);
  const { inclusive } = priceWithServiceCharge(base, rate);
  const pct = Math.round(rate * 100);
  return `Buyers will see BDT ${inclusive} (base + ${pct}% service charge)`;
}
