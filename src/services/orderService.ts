import { Order, OrderStatus, Coupon, Review } from '../types';
import { storage } from './storageService';
import { api } from './api';

export const orderService = {
  async getOrders(userId?: string): Promise<Order[]> {
    const endpoint = userId ? `/orders?userId=${userId}` : '/orders';
    return api.get<Order[]>(endpoint, () => {
      const orders = storage.getOrders();
      return userId ? orders.filter((o) => o.userId === userId) : orders;
    });
  },

  async getOrderById(id: string): Promise<Order | null> {
    return api.get<Order | null>(`/orders/${id}`, () => {
      const orders = storage.getOrders();
      return orders.find((o) => o.id === id || o.orderNumber === id) || null;
    });
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.getOrderById(orderNumber);
  },

  async createOrder(
    orderInput: Omit<Order, 'id' | 'orderNumber' | 'statusHistory' | 'createdAt' | 'status' | 'estimatedDelivery'>
  ): Promise<Order> {
    return api.post<Order>('/orders', orderInput, () => {
      const orders = storage.getOrders();
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
            note: `Order placed successfully via ${orderInput.paymentMethod.toUpperCase()}.`,
          },
        ],
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      storage.saveOrders([newOrder, ...orders]);
      return newOrder;
    });
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order | null> {
    return api.put<Order | null>(`/orders/${id}/status`, { status, note }, () => {
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
      orders[idx] = order;
      storage.saveOrders(orders);
      return order;
    });
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    return api.get<Coupon[]>('/coupons', () => storage.getCoupons());
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; message: string; discountAmount: number }> {
    return api.post<{ valid: boolean; coupon?: Coupon; message: string; discountAmount: number }>(
      '/coupons/validate',
      { code, subtotal },
      () => {
        const coupons = storage.getCoupons();
        const coupon = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase() && c.isActive);
        if (!coupon) return { valid: false, message: 'Invalid or inactive promotional code.', discountAmount: 0 };
        if (new Date(coupon.expiryDate) < new Date()) return { valid: false, message: 'This promotion has expired.', discountAmount: 0 };
        if (subtotal < coupon.minPurchase) return { valid: false, message: `Minimum order value of $${coupon.minPurchase} required.`, discountAmount: 0 };
        const discountAmount = coupon.discountPercentage
          ? Math.round(((subtotal * coupon.discountPercentage) / 100) * 100) / 100
          : Math.min(subtotal, coupon.fixedAmount || 0);
        return { valid: true, coupon, message: 'Voucher applied successfully', discountAmount };
      }
    );
  },

  async createCoupon(coupon: Omit<Coupon, 'id' | 'timesUsed'>): Promise<Coupon> {
    return api.post<Coupon>('/coupons', coupon, () => {
      const coupons = storage.getCoupons();
      const newC: Coupon = { ...coupon, id: `coup-${Date.now()}`, timesUsed: 0 };
      storage.saveCoupons([newC, ...coupons]);
      return newC;
    });
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    return api.put<Coupon | null>(`/coupons/${id}`, updates, () => {
      const coupons = storage.getCoupons();
      const idx = coupons.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      coupons[idx] = { ...coupons[idx], ...updates };
      storage.saveCoupons(coupons);
      return coupons[idx];
    });
  },

  async deleteCoupon(id: string): Promise<boolean> {
    return api.delete<{ success: boolean }>(`/coupons/${id}`, () => {
      const coupons = storage.getCoupons();
      storage.saveCoupons(coupons.filter((c) => c.id !== id));
      return { success: true };
    }).then(() => true);
  },

  // Reviews
  async getReviews(productId?: string): Promise<Review[]> {
    const endpoint = productId ? `/reviews?productId=${productId}` : '/reviews';
    return api.get<Review[]>(endpoint, () => {
      const reviews = storage.getReviews();
      return productId ? reviews.filter((r) => r.productId === productId) : reviews;
    });
  },

  async addReview(reviewData: Omit<Review, 'id' | 'date' | 'status'>): Promise<Review> {
    return api.post<Review>('/reviews', reviewData, () => {
      const reviews = storage.getReviews();
      const newReview: Review = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: 'approved',
      };
      storage.saveReviews([newReview, ...reviews]);
      return newReview;
    });
  },

  async updateReviewStatus(id: string, status: 'approved' | 'hidden'): Promise<Review | null> {
    return api.put<Review | null>(`/reviews/${id}/status`, { status }, () => {
      const reviews = storage.getReviews();
      const idx = reviews.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      reviews[idx].status = status;
      storage.saveReviews(reviews);
      return reviews[idx];
    });
  },

  async deleteReview(id: string): Promise<boolean> {
    return api.delete<{ success: boolean }>(`/reviews/${id}`, () => {
      const reviews = storage.getReviews();
      storage.saveReviews(reviews.filter((r) => r.id !== id));
      return { success: true };
    }).then(() => true);
  },
};
