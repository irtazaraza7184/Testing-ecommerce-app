import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Eye,
  CheckCircle,
  Database,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { customerService, DashboardMetrics } from '../../services/customerService';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

export const AdminOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const [m, ords] = await Promise.all([
        customerService.getDashboardMetrics(),
        orderService.getOrders(),
      ]);
      setMetrics(m);
      setRecentOrders(ords.slice(0, 5));
      setLoading(false);
    };
    loadDashboard();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-mono">Aggregating commercial analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Date Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Commercial Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time store performance, gross margins, and fulfillment pipelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/database"
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cloud Database</span>
          </Link>
          <Link
            to="/admin/products"
            className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Manage Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Fulfill Orders</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              ${metrics.totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14.8%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">vs. preceding 30 days</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Dispatches
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {metrics.totalOrders.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">({metrics.pendingOrders} pending)</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">99.4% on-time fulfillment</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Catalog
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {metrics.totalProducts}
            </span>
            <span className="text-xs text-amber-400 font-medium">
              {metrics.lowStockCount} low stock
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across 6 luxury disciplines</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Registered Clients
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {metrics.totalCustomers.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400">+28 this week</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">42% repeat purchasing rate</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Growth Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Sales Trajectory & Monthly Revenue
              </h2>
              <span className="text-xs text-slate-400 font-mono">Gross revenue in $ USD</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
              Profitable Trajectory
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Top Selling Works
            </h2>
            <div className="space-y-4">
              {metrics.topSellingProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs pb-3 border-b border-slate-900 last:border-b-0">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-slate-200 block truncate">{p.name}</span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {p.sales} units · {p.stock} left
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 shrink-0">
                    ${p.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              to="/admin/reports"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-between"
            >
              <span>View Full Analytics Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Dispatches Table */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Dispatches
            </h2>
            <span className="text-xs text-slate-400">Latest orders submitted across all storefront channels</span>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5 px-4">{ord.customerName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{ord.createdAt}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${ord.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize text-emerald-400 font-medium">
                      {ord.paymentMethod.toUpperCase()} (Paid)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ord.status === 'shipped'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/admin/orders"
                      className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
