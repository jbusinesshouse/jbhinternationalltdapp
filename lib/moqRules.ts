/** Buyer minimum for a wholesale listing. Mirrors the API and database trigger. */
export const WHOLESALE_MIN_ORDER_QTY = 6;
/** Buyer minimum for a retail listing. */
export const RETAIL_MIN_ORDER_QTY = 1;

export function isProductListingAccount(
  storeType: string | null | undefined
): boolean {
  return storeType === "wholesale" || storeType === "retail";
}

export function minimumOrderQuantityForStoreType(
  storeType: string | null | undefined
): number | null {
  if (storeType === "wholesale") return WHOLESALE_MIN_ORDER_QTY;
  if (storeType === "retail") return RETAIL_MIN_ORDER_QTY;
  return null;
}

/** Bengali form error. `null` moq means the field is empty or not a positive integer. */
export function moqValidationMessage(
  storeType: string | null | undefined,
  moq: number | null
): string | null {
  if (moq == null || !Number.isInteger(moq)) {
    return "সঠিক ন্যূনতম অর্ডার পরিমাণ (MOQ) লিখুন।";
  }
  const min = minimumOrderQuantityForStoreType(storeType);
  if (min == null) {
    return "শুধুমাত্র রিটেইল বা হোলসেল বিক্রেতারা প্রোডাক্ট আপলোড করতে পারবেন।";
  }
  if (moq < min) {
    return storeType === "wholesale"
      ? `হোলসেলের ন্যূনতম অর্ডার পরিমাণ কমপক্ষে ${min} হতে হবে।`
      : `রিটেইলের ন্যূনতম অর্ডার পরিমাণ কমপক্ষে ${min} হতে হবে।`;
  }
  return null;
}
