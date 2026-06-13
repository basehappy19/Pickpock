/**
 * Discount calculation utilities
 */

import { Tier, DiscountRule, Coupon } from '@/types';

/**
 * Calculate final price with tier discount
 */
export function calculateTierDiscount(
  price: number,
  tier: Tier
): { discountedPrice: number; discountAmount: number; discountPercent: number } {
  const discountPercent = tier === 'VIP' ? 10 : 0;
  const discountAmount = (price * discountPercent) / 100;
  const discountedPrice = price - discountAmount;

  return {
    discountedPrice: Math.max(0, discountedPrice),
    discountAmount,
    discountPercent
  };
}

/**
 * Calculate price with bulk discount
 */
export function calculateBulkDiscount(
  unitPrice: number,
  quantity: number
): { totalPrice: number; discountAmount: number; appliedRule: string | null } {
  // Bulk discount rules
  const bulkRules = [
    { minQty: 10, discount: 15, name: '10+ items: 15% off' },
    { minQty: 5, discount: 10, name: '5+ items: 10% off' },
    { minQty: 3, discount: 5, name: '3+ items: 5% off' }
  ];

  const appliedRule = bulkRules.find(rule => quantity >= rule.minQty);

  if (appliedRule) {
    const baseTotal = unitPrice * quantity;
    const discountAmount = (baseTotal * appliedRule.discount) / 100;
    return {
      totalPrice: baseTotal - discountAmount,
      discountAmount,
      appliedRule: appliedRule.name
    };
  }

  return {
    totalPrice: unitPrice * quantity,
    discountAmount: 0,
    appliedRule: null
  };
}

/**
 * Apply coupon discount
 */
export function calculateCouponDiscount(
  subtotal: number,
  coupon: Coupon
): { discountedTotal: number; discountAmount: number; isValid: boolean; error?: string } {
  // Check if coupon has expired
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return {
      discountedTotal: subtotal,
      discountAmount: 0,
      isValid: false,
      error: 'Coupon has expired'
    };
  }

  // Check minimum purchase
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return {
      discountedTotal: subtotal,
      discountAmount: 0,
      isValid: false,
      error: `Minimum purchase of ฿${coupon.minPurchase} required`
    };
  }

  let discountAmount = 0;

  if (coupon.type === 'fixed') {
    discountAmount = coupon.discount;
  } else {
    discountAmount = (subtotal * coupon.discount) / 100;

    // Apply max discount limit if set
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  }

  return {
    discountedTotal: Math.max(0, subtotal - discountAmount),
    discountAmount,
    isValid: true
  };
}

/**
 * Calculate all applicable discounts for a cart
 */
export function calculateCartDiscounts(
  items: Array<{ productId: string; name: string; price: number; quantity: number }>,
  userTier: Tier,
  coupon?: Coupon
): {
  subtotal: number;
  tierDiscount: number;
  bulkDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  finalTotal: number;
  appliedDiscounts: string[];
} {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate tier discount
  let tierDiscount = 0;
  if (userTier === 'VIP') {
    tierDiscount = (subtotal * 10) / 100;
  }

  // Calculate bulk discounts
  let bulkDiscount = 0;
  items.forEach(item => {
    const result = calculateBulkDiscount(item.price, item.quantity);
    bulkDiscount += result.discountAmount;
  });

  // Apply coupon discount
  let couponDiscount = 0;
  let couponAmount = 0;
  if (coupon) {
    const remainingTotal = subtotal - tierDiscount - bulkDiscount;
    const couponResult = calculateCouponDiscount(remainingTotal, coupon);
    if (couponResult.isValid) {
      couponAmount = couponResult.discountAmount;
    }
  }
  couponDiscount = couponAmount;

  const totalDiscount = tierDiscount + bulkDiscount + couponDiscount;
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  const appliedDiscounts: string[] = [];
  if (tierDiscount > 0) appliedDiscounts.push(`VIP Tier: 10% off`);
  if (bulkDiscount > 0) appliedDiscounts.push(`Bulk Purchase Discount`);
  if (couponDiscount > 0) appliedDiscounts.push(`Coupon: ${coupon?.code || 'Applied'}`);

  return {
    subtotal,
    tierDiscount,
    bulkDiscount,
    couponDiscount,
    totalDiscount,
    finalTotal,
    appliedDiscounts
  };
}

/**
 * Validate coupon code
 */
export function validateCoupon(
  code: string,
  coupons: Coupon[],
  userTier?: Tier
): { isValid: boolean; coupon?: Coupon; error?: string } {
  const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase());

  if (!coupon) {
    return { isValid: false, error: 'Invalid coupon code' };
  }

  // Check if coupon is for specific tiers only
  if (coupon.applicableTiers && userTier && !coupon.applicableTiers.includes(userTier)) {
    return { isValid: false, error: `This coupon is only for ${coupon.applicableTiers.join(' / ')} members` };
  }

  // Check expiry
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { isValid: false, error: 'This coupon has expired' };
  }

  return { isValid: true, coupon };
}

/**
 * Get all available coupons for user tier
 */
export function getAvailableCoupons(coupons: Coupon[], userTier: Tier): Coupon[] {
  return coupons.filter(coupon =>
    !coupon.applicableTiers || coupon.applicableTiers.includes(userTier)
  );
}
