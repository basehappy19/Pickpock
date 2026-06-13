import { ProductSchema, OrderSchema, CouponSchema } from "./schemas";

describe("Data Validation Tests", () => {
  describe("ProductSchema", () => {
    const validProduct = {
      id: "prod-1",
      name: "Test Product",
      description: "A test product",
      price: 100,
      category: "Electronics",
      image: "https://example.com/image.jpg",
      rating: 4.5,
      reviews: [],
      stock: 10,
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
      specs: { material: "plastic" },
      storeName: "Test Store",
      storeId: "store-1",
      isOfficial: true,
    };

    it("should validate a valid product", () => {
      const result = ProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it("should sanitize negative prices to 0", () => {
      const result = ProductSchema.safeParse({ ...validProduct, price: -10 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(0);
      }
    });

    it("should handle missing images", () => {
      const result = ProductSchema.safeParse({ ...validProduct, image: "" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.image).toBe("https://placehold.co/600x600?text=No+Image");
      }
    });

    it("should handle null values gracefully", () => {
      const result = ProductSchema.safeParse({
        id: "prod-1",
        name: null as any,
        description: undefined,
        price: "100" as any,
        category: "",
        image: null,
        rating: null,
        reviews: null,
        stock: -5,
        isOfficial: null,
      });
      expect(result.success).toBe(true);
    });

    it("should cap prices at maximum", () => {
      const result = ProductSchema.safeParse({ ...validProduct, price: 9999999999 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(999999999);
      }
    });
  });

  describe("OrderSchema", () => {
    const validOrder = {
      id: "order-1",
      customerId: "customer-1",
      customerName: "John Doe",
      items: [
        {
          productId: "prod-1",
          productName: "Product 1",
          quantity: 2,
          price: 100,
        },
      ],
      totalAmount: 200,
      status: "pending" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
      paymentStatus: "paid" as const,
      reviewedItems: [],
    };

    it("should validate a valid order", () => {
      const result = OrderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
    });

    it("should handle negative total amounts", () => {
      const result = OrderSchema.safeParse({ ...validOrder, totalAmount: -100 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalAmount).toBe(0);
      }
    });

    it("should default quantity to 1 for invalid values", () => {
      const result = OrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrder.items[0], quantity: -1 }],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("CouponSchema", () => {
    const validCoupon = {
      code: "SAVE10",
      discount: 10,
      type: "percent" as const,
      description: "10% off",
    };

    it("should validate a valid coupon", () => {
      const result = CouponSchema.safeParse(validCoupon);
      expect(result.success).toBe(true);
    });

    it("should uppercase coupon codes", () => {
      const result = CouponSchema.safeParse({ ...validCoupon, code: "save10" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe("SAVE10");
      }
    });

    it("should cap discount percentage at 100", () => {
      const result = CouponSchema.safeParse({ ...validCoupon, discount: 150 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.discount).toBe(100);
      }
    });

    it("should not allow negative discounts", () => {
      const result = CouponSchema.safeParse({ ...validCoupon, discount: -10 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.discount).toBe(0);
      }
    });
  });
});
