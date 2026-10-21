/** Mirrors backend/src/services/vat.ts — display fallback only; orders trust the server. */

export const VAT_RATE_WHOLESALE = 0.1;
export const VAT_RATE_RETAIL = 0.15;

export type SellerStoreType = "wholesale" | "retail" | string | null | undefined;

export type VatBreakdown = {
  base: number;
  vat: number;
  inclusive: number;
  rate: number;
};

export function vatRateForSellerStoreType(storeType: SellerStoreType): number {
  if (storeType === "wholesale") return VAT_RATE_WHOLESALE;
  return VAT_RATE_RETAIL;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function priceWithVat(base: number, rate: number): VatBreakdown {
  const safeBase = roundMoney(Number(base) || 0);
  const safeRate = Number(rate) || 0;
  const inclusive = roundMoney(safeBase * (1 + safeRate));
  const vat = roundMoney(inclusive - safeBase);
  return { base: safeBase, vat, inclusive, rate: safeRate };
}

/** Live hint under seller price field. */
export function buyerPriceVatHint(
  baseInput: string | number,
  storeType: SellerStoreType
): string | null {
  const base = typeof baseInput === "string" ? Number(baseInput) : baseInput;
  if (!Number.isFinite(base) || base <= 0) return null;
  const rate = vatRateForSellerStoreType(storeType);
  const { inclusive } = priceWithVat(base, rate);
  const pct = Math.round(rate * 100);
  return `Buyers will see BDT ${inclusive} (base + ${pct}% VAT)`;
}
