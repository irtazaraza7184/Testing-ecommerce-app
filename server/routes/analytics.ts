import { Router, Request, Response } from 'express';
import { db } from '../db';

export const analyticsRouter = Router();

// GET /api/analytics/dashboard
analyticsRouter.get('/dashboard', (_req: Request, res: Response) => {
  const orders = db.get('orders');
  const products = db.get('products');
  const customers = db.get('customers');

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
    {
      name: 'Kallisto Titanium Chronograph 41mm',
      sales: 44,
      revenue: 63800,
      stock: products.find((p) => p.id === 'prod-03')?.stock || 5,
    },
    {
      name: 'Travertine Sculptural Table Lantern',
      sales: 89,
      revenue: 21805,
      stock: products.find((p) => p.id === 'prod-04')?.stock || 19,
    },
  ];

  res.json({
    success: true,
    data: {
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
    },
  });
});
