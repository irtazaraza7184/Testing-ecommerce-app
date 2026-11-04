import { Order, OrderStatus, Coupon, Review } from '../types';
import { storage } from './storageService';
import { firestoreService } from './firestoreService';

export const orderService = {
  async getOrders(userId?: string): Promise<Order[]> {
    let orders: Order[] = [];
    try {
      orders = await firestoreService.getOrders();
      if (!orders || orders.length === 0) {
        orders = storage.getOrders();
      } else {
        storage.saveOrders(orders);
      }
    } catch {
      orders = storage.getOrders();
    }

    if (userId) {
      return orders.filter((o) => o.userId === userId);
    }
    return orders;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    const term = id.toLowerCase().trim();
    return orders.find((o) => o.id.toLowerCase() === term || o.orderNumber.toLowerCase() === term) || null;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.getOrderById(orderNumber);
  },

  async createOrder(
    orderInput: Omit<Order, 'id' | 'orderNumber' | 'statusHistory' | 'createdAt' | 'status' | 'estimatedDelivery'>
  ): Promise<Order> {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AUR-${new Date().getFullYear()}-${uniqueNum}`;

    const newOrder: Order = {
      ...orderInput,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: dateStr,
          note: `Order verified and placed via ${orderInput.paymentMethod.toUpperCase()}.`,
        },
      ],
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    // Save to Firestore
    await firestoreService.saveOrder(newOrder);

    // Save to local cache
    const orders = storage.getOrders();
    storage.saveOrders([newOrder, ...orders]);

    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order | null> {
    await firestoreService.updateOrderStatus(id, status, note);

    const orders = storage.getOrders();
    const idx = orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) return null;

    const order = orders[idx];
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: note || `Order status updated to ${status}.`,
    });

    if (status === 'shipped' && !order.trackingNumber) {
      order.trackingNumber = `FX-${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    orders[idx] = order;
    storage.saveOrders(orders);
    return order;
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    try {
      const coupons = await firestoreService.getCoupons();
      if (coupons && coupons.length > 0) {
        storage.saveCoupons(coupons);
        return coupons;
      }
    } catch {
      // fallback
    }
    return storage.getCoupons();
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; message: string; discountAmount: number }> {
    const coupons = await this.getCoupons();
    const coupon = coupons.find(
      (c) => c.code.toLowerCase() === code.trim().toLowerCase() && c.isActive
    );

    if (!coupon) {
      return { valid: false, message: 'Invalid or inactive promotional voucher.', discountAmount: 0 };
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, message: 'This promotion has expired.', discountAmount: 0 };
    }

    if (subtotal < coupon.minPurchase) {
      return {
        valid: false,
        message: `Minimum order value of $${coupon.minPurchase} required.`,
        discountAmount: 0,
      };
    }

    let discountAmount = 0;
    if (coupon.discountPercentage) {
      discountAmount = Math.round(((subtotal * coupon.discountPercentage) / 100) * 100) / 100;
    } else if (coupon.fixedAmount) {
      discountAmount = Math.min(subtotal, coupon.fixedAmount);
    }

    return {
      valid: true,
      coupon,
      message: `Voucher applied: ${coupon.discountPercentage ? `${coupon.discountPercentage}% off` : `$${coupon.fixedAmount} off`}`,
      discountAmount,
    };
  },

  async createCoupon(coupon: Omit<Coupon, 'id' | 'timesUsed'>): Promise<Coupon> {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coup-${Date.now()}`,
      timesUsed: 0,
    };
    await firestoreService.saveCoupon(newCoupon);
    const coupons = storage.getCoupons();
    storage.saveCoupons([newCoupon, ...coupons]);
    return newCoupon;
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    const coupons = storage.getCoupons();
    const idx = coupons.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    coupons[idx] = { ...coupons[idx], ...updates };
    storage.saveCoupons(coupons);
    await firestoreService.saveCoupon(coupons[idx]);
    return coupons[idx];
  },

  async deleteCoupon(id: string): Promise<boolean> {
    await firestoreService.deleteCoupon(id);
    const coupons = storage.getCoupons();
    storage.saveCoupons(coupons.filter((c) => c.id !== id));
    return true;
  },

  // Reviews
  async getReviews(productId?: string): Promise<Review[]> {
    let reviews: Review[] = [];
    try {
      reviews = await firestoreService.getReviews();
      if (!reviews || reviews.length === 0) {
        reviews = storage.getReviews();
      } else {
        storage.saveReviews(reviews);
      }
    } catch {
      reviews = storage.getReviews();
    }

    if (productId) {
      return reviews.filter((r) => r.productId === productId);
    }
    return reviews;
  },

  async addReview(reviewData: Omit<Review, 'id' | 'date' | 'status'>): Promise<Review> {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'approved',
    };
    await firestoreService.saveReview(newReview);
    const reviews = storage.getReviews();
    storage.saveReviews([newReview, ...reviews]);
    return newReview;
  },

  async updateReviewStatus(id: string, status: 'approved' | 'hidden'): Promise<Review | null> {
    await firestoreService.updateReviewStatus(id, status);
    const reviews = storage.getReviews();
    const idx = reviews.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    reviews[idx].status = status;
    storage.saveReviews(reviews);
    return reviews[idx];
  },

  async deleteReview(id: string): Promise<boolean> {
    await firestoreService.deleteReview(id);
    const reviews = storage.getReviews();
    storage.saveReviews(reviews.filter((r) => r.id !== id));
    return true;
  },
};
