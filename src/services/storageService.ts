import {
  Product,
  Category,
  Order,
  Customer,
  Review,
  Coupon,
  Address,
  InventoryLog,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
  INITIAL_INVENTORY_LOGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'aura_products',
  CATEGORIES: 'aura_categories',
  ORDERS: 'aura_orders',
  CUSTOMERS: 'aura_customers',
  REVIEWS: 'aura_reviews',
  COUPONS: 'aura_coupons',
  INVENTORY_LOGS: 'aura_inventory_logs',
  CART: 'aura_cart',
  WISHLIST: 'aura_wishlist',
  CURRENT_USER: 'aura_current_user',
};

// Generic storage getters with seeding fallback
export const storage = {
  getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCategories(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getOrders(): Order[] {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },

  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getReviews(): Review[] {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_REVIEWS;
    }
  },

  saveReviews(reviews: Review[]): void {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  },

  getCoupons(): Coupon[] {
    const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_COUPONS;
    }
  },

  saveCoupons(coupons: Coupon[]): void {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  },

  getInventoryLogs(): InventoryLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(INITIAL_INVENTORY_LOGS));
      return INITIAL_INVENTORY_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_INVENTORY_LOGS;
    }
  },

  saveInventoryLogs(logs: InventoryLog[]): void {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(logs));
  },

  resetToDefaults(): void {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(INITIAL_INVENTORY_LOGS));
  },
};
