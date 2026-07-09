export const BATCH_SIZE = 20;

export type ProductFeedItem = {
  id: string;
  productImg: string | null;
  name: string;
  price: string;
  moq: number;
};

/** Fisher-Yates shuffle — O(n) randomization without DB ORDER BY RANDOM(). */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Map raw Supabase rows to the shape expected by SingleProduct. */
export function formatProducts(
  data: any[],
  blockedUserIds: string[]
): ProductFeedItem[] {
  return data
    .filter(
      (product) =>
        !blockedUserIds.length || !blockedUserIds.includes(product.seller_id)
    )
    .map((product) => {
      const mainImage = product.product_images?.find(
        (img: any) => img.is_main === true
      );

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        moq: product.moq,
        productImg: mainImage?.image_url || null,
      };
    });
}
