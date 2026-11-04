import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Product, Category, Order, Customer, Review, Coupon, InventoryLog } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
  INITIAL_INVENTORY_LOGS,
} from '../data/mockData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error]', JSON.stringify(errInfo));
}

let isInitialized = false;

export const firestoreService = {
  async initializeDatabase(): Promise<void> {
    if (isInitialized) return;
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) {
        console.log('[Firestore] Seeding master catalog and categories to live Firebase...');
        // Seed categories
        for (const cat of INITIAL_CATEGORIES) {
          await setDoc(doc(db, 'categories', cat.id), cat);
        }
        // Seed products
        for (const prod of INITIAL_PRODUCTS) {
          await setDoc(doc(db, 'products', prod.id), prod);
        }
        // Seed orders
        for (const ord of INITIAL_ORDERS) {
          await setDoc(doc(db, 'orders', ord.id), ord);
        }
        // Seed customers
        for (const cust of INITIAL_CUSTOMERS) {
          await setDoc(doc(db, 'customers', cust.id), cust);
        }
        // Seed reviews
        for (const rev of INITIAL_REVIEWS) {
          await setDoc(doc(db, 'reviews', rev.id), rev);
        }
        // Seed coupons
        for (const coup of INITIAL_COUPONS) {
          await setDoc(doc(db, 'coupons', coup.id), coup);
        }
        // Seed inventory logs
        for (const log of INITIAL_INVENTORY_LOGS) {
          await setDoc(doc(db, 'inventoryLogs', log.id), log);
        }
        console.log('[Firestore] Seeding completed successfully.');
      }
      isInitialized = true;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    await this.initializeDatabase();
    try {
      const snap = await getDocs(collection(db, 'products'));
      return snap.docs.map((d) => d.data() as Product);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
      return INITIAL_PRODUCTS;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) return snap.data() as Product;
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `products/${id}`);
      return null;
    }
  },

  async saveProduct(product: Product): Promise<void> {
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', id), updates as any);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    await this.initializeDatabase();
    try {
      const snap = await getDocs(collection(db, 'categories'));
      return snap.docs.map((d) => d.data() as Category);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'categories');
      return INITIAL_CATEGORIES;
    }
  },

  async saveCategory(cat: Category): Promise<void> {
    try {
      await setDoc(doc(db, 'categories', cat.id), cat);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${cat.id}`);
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    try {
      await updateDoc(doc(db, 'categories', id), updates as any);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    await this.initializeDatabase();
    try {
      const snap = await getDocs(collection(db, 'orders'));
      return snap.docs.map((d) => d.data() as Order);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
      return INITIAL_ORDERS;
    }
  },

  async saveOrder(order: Order): Promise<void> {
    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
    }
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<void> {
    try {
      const snap = await getDoc(doc(db, 'orders', id));
      if (snap.exists()) {
        const ord = snap.data() as Order;
        ord.status = status as any;
        ord.statusHistory.push({
          status: status as any,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: note || `Order updated to ${status}.`,
        });
        await setDoc(doc(db, 'orders', id), ord);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
    }
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    await this.initializeDatabase();
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      return snap.docs.map((d) => d.data() as Coupon);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'coupons');
      return INITIAL_COUPONS;
    }
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    try {
      await setDoc(doc(db, 'coupons', coupon.id), coupon);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `coupons/${coupon.id}`);
    }
  },

  async deleteCoupon(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `coupons/${id}`);
    }
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    await this.initializeDatabase();
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      return snap.docs.map((d) => d.data() as Review);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'reviews');
      return INITIAL_REVIEWS;
    }
  },

  async saveReview(review: Review): Promise<void> {
    try {
      await setDoc(doc(db, 'reviews', review.id), review);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reviews/${review.id}`);
    }
  },

  async updateReviewStatus(id: string, status: 'approved' | 'hidden'): Promise<void> {
    try {
      await updateDoc(doc(db, 'reviews', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`);
    }
  },

  async deleteReview(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
    }
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    await this.initializeDatabase();
    try {
      const snap = await getDocs(collection(db, 'customers'));
      return snap.docs.map((d) => d.data() as Customer);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'customers');
      return INITIAL_CUSTOMERS;
    }
  },

  async updateCustomerStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
    try {
      await updateDoc(doc(db, 'customers', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customers/${id}`);
    }
  },

  // Inventory logs
  async getInventoryLogs(): Promise<InventoryLog[]> {
    await this.initializeDatabase();
    try {
      const snap = await getDocs(collection(db, 'inventoryLogs'));
      return snap.docs.map((d) => d.data() as InventoryLog);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'inventoryLogs');
      return INITIAL_INVENTORY_LOGS;
    }
  },
};
