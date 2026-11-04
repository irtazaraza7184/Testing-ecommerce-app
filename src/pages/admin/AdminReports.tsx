import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp, Calendar, DollarSign, ShoppingBag, Award } from 'lucide-react';
import { customerService, DashboardMetrics } from '../../services/customerService';
import { useToast } from '../../context/ToastContext';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'];

export const AdminReports: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    customerService.getDashboardMetrics().then((m) => {
      setMetrics(m);
      setLoading(false);
    });
  }, []);

  const handleExportCSV = () => {
    toast.success('Generated commercial report export: AURA_Sales_Audit_2026.csv');
  };

  if (loading || !metrics) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-mono">Compiling financial performance charts...</p>
      </div>
    );
  }

  // Simulated Weekly vs Monthly data
  const chartData =
    timeframe === 'weekly'
      ? [
          { name: 'Mon', revenue: 4200, orders: 12 },
          { name: 'Tue', revenue: 6100, orders: 18 },
          { name: 'Wed', revenue: 5800, orders: 15 },
          { name: 'Thu', revenue: 8400, orders: 24 },
          { name: 'Fri', revenue: 11200, orders: 32 },
          { name: 'Sat', revenue: 14500, orders: 39 },
          { name: 'Sun', revenue: 9800, orders: 28 },
        ]
      : metrics.salesData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Departmental distribution, order density, and customer lifecycle growth
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeframe === 'weekly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeframe === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Revenue Bar Chart */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {timeframe === 'weekly' ? 'Weekly Gross Inflow' : 'Monthly Gross Volume'} ($ USD)
            </h2>
            <span className="text-xs text-slate-400 font-mono">Consolidated store channels</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            ${metrics.totalRevenue.toLocaleString()} Total Run Rate
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Gross Inflow']}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Category Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Catalog Category Concentration
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Inventory share distributed across architectural and acoustic divisions
            </p>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.categoryDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {metrics.categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(val: any, name: any) => [`${val} Objects`, name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Customer Growth & Acquisition */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Order Volume & Consignments
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Number of verified customer orders completed per cycle
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(val: any) => [`${val} Orders`, 'Volume']}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
