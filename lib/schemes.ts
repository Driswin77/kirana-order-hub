// lib/schemes.ts

export type SchemeInput = {
  type: 'BUY_X_GET_Y' | 'SLAB_DISCOUNT';
  buyQty?: number | null;
  freeQty?: number | null;
  minQty?: number | null;
  discountPct?: number | null;
} | null;

export type SchemeResult = {
  freeQty: number;
  discountPct: number;
  discountAmount: number;
  finalAmount: number;
};

/**
 * Calculates the scheme benefits for a single order line.
 * This handles partial sets for Buy X Get Y (e.g., 25 cases of a Buy 10 Get 1 scheme = 2 free).
 */
export function calculateScheme(
  quantity: number,
  unitPrice: number,
  scheme: SchemeInput
): SchemeResult {
  const baseAmount = quantity * unitPrice;

  // Default: No scheme applied
  if (!scheme || quantity <= 0) {
    return { freeQty: 0, discountPct: 0, discountAmount: 0, finalAmount: baseAmount };
  }

  // 1. Buy X Get Y (e.g., Buy 10 Get 1)
  if (scheme.type === 'BUY_X_GET_Y' && scheme.buyQty && scheme.freeQty) {
    // Math.floor(25 / 10) = 2 sets. So 2 free items.
    const sets = Math.floor(quantity / scheme.buyQty);
    const freeQty = sets * scheme.freeQty;
    
    // The retailer pays for the quantity ordered (the free items are extra)
    return { 
      freeQty, 
      discountPct: 0, 
      discountAmount: 0, 
      finalAmount: baseAmount 
    };
  }

  // 2. Slab Discount (e.g., 3% off on 5+)
  if (scheme.type === 'SLAB_DISCOUNT' && scheme.minQty && scheme.discountPct) {
    if (quantity >= scheme.minQty) {
      const discountAmount = baseAmount * (scheme.discountPct / 100);
      return {
        freeQty: 0,
        discountPct: scheme.discountPct,
        discountAmount,
        finalAmount: baseAmount - discountAmount,
      };
    }
  }

  return { freeQty: 0, discountPct: 0, discountAmount: 0, finalAmount: baseAmount };
}