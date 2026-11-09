import { describe, it, expect } from 'vitest';
import { calculateScheme } from './schemes';

describe('Scheme Engine', () => {
  it('should apply Buy 10 Get 1 correctly for exact multiples', () => {
    const scheme = { type: 'BUY_X_GET_Y' as const, buyQty: 10, freeQty: 1 };
    const result = calculateScheme(10, 8.10, scheme);
    expect(result.freeQty).toBe(1);
    expect(result.discountAmount).toBe(0);
  });

  it('should handle partial sets (e.g., 25 cases of Buy 10 Get 1 = 2 free)', () => {
    const scheme = { type: 'BUY_X_GET_Y' as const, buyQty: 10, freeQty: 1 };
    const result = calculateScheme(25, 8.10, scheme);
    expect(result.freeQty).toBe(2); // 2 sets of 10
  });

  it('should apply Slab Discount only above the minimum quantity', () => {
    const scheme = { type: 'SLAB_DISCOUNT' as const, minQty: 5, discountPct: 3 };
    
    // Below threshold
    const below = calculateScheme(4, 101.50, scheme);
    expect(below.discountPct).toBe(0);
    expect(below.discountAmount).toBe(0);

    // Above threshold
    const above = calculateScheme(5, 101.50, scheme);
    expect(above.discountPct).toBe(3);
    expect(above.discountAmount).toBeGreaterThan(0); // 5 * 101.50 * 0.03
  });
});