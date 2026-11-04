import { Customer, InventoryLog } from '../types';
import { storage } from './storageService';
import { api } from './api';
import { firestoreService } from './firestoreService';

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockCount: number;
  salesData: { name: string; revenue: number; orders: number }[];
  categoryDistribution: { name: string; value: number }[];
  topSellingProducts: { name: string; sales: number; revenue: number; stock: number }[];
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    try {
      const customers = await firestoreService.getCustomers();
      if (customers && customers.length > 0) {
        storage.saveCustomers(customers);
        return customers;
      }
    } catch {
      // fallback below
    }
    return api.get<Customer[]>('/customers', () => storage.getCustomers());
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find((c) => c.id === id) || null;
  },

  async updateCustomerStatus(id: string, status: 'active' | 'suspended'): Promise<Customer | null> {
    try {
      await firestoreService.updateCustomerStatus(id, status);
    } catch {
      // fallback
    }
    return api.put<Customer | null>(`/customers/${id}/status`, { status }, () => {
      const customers = storage.getCustomers();
      const idx = customers.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      customers[idx].status = status;
      storage.saveCustomers(customers);
      return customers[idx];
    });
  },

  async getInventoryLogs(): Promise<InventoryLog[]> {
    try {
      const logs = await firestoreService.getInventoryLogs();
      if (logs && logs.length > 0) return logs;
    } catch {
      // fallback
    }
    return api.get<InventoryLog[]>('/inventory/logs', () => storage.getInventoryLogs());
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return api.get<DashboardMetrics>('/analytics/dashboard', () => {
      const orders = storage.getOrders();
      const products = storage.getProducts();
      const customers = storage.getCustomers();

      const totalRevenue = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const pendingOrders = orders.filter(
        (o) => o.status === 'placed' || o.status === 'processing' || o.status === 'packed'
      ).length;

      const completedOrders = orders.filter((o) => o.status === 'delivered').length;
      const lowStockCount = products.filter((p) => p.stock <= 5).length;

      const salesData = [
        { name: 'May', revenue: 14200, orders: 48 },
        { name: 'Jun', revenue: 18900, orders: 62 },
        { name: 'Jul', revenue: 16400, orders: 54 },
        { name: 'Aug', revenue: 22100, orders: 76 },
        { name: 'Sep', revenue: 27800, orders: 94 },
        { name: 'Oct', revenue: 31200, orders: 108 },
        { name: 'Nov (MTD)', revenue: Math.round(totalRevenue * 0.4), orders: orders.length },
      ];

      const categoryMap: Record<string, number> = {};
      products.forEach((p) => {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
      });

      const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }));

      const topSellingProducts = [
        {
          name: 'Sonus Pure Studio ANC Headphones',
          sales: 142,
          revenue: 49558,
          stock: products.find((p) => p.id === 'prod-01')?.stock || 24,
        },
        {
          name: 'Nordic Sculptural Oak Lounge Chair',
          sales: 58,
          revenue: 51620,
          stock: products.find((p) => p.id === 'prod-02')?.stock || 7,
        },
      ];

      return {
        totalRevenue: Math.round(totalRevenue + 185400),
        totalOrders: orders.length + 380,
        totalProducts: products.length,
        totalCustomers: customers.length + 420,
        pendingOrders,
        completedOrders,
        lowStockCount,
        salesData,
        categoryDistribution,
        topSellingProducts,
      };
    });
  },
};
