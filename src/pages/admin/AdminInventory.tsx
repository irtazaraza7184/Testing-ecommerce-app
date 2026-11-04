import React, { useEffect, useState } from 'react';
import { Archive, Plus, Minus, AlertTriangle, Search, History, Check } from 'lucide-react';
import { Product, InventoryLog } from '../../types';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { useToast } from '../../context/ToastContext';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    const [prods, lg] = await Promise.all([
      productService.getProducts(),
      customerService.getInventoryLogs(),
    ]);
    setProducts(prods);
    setLogs(lg);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjust = async (productId: string, delta: number, name: string) => {
    const updated = await productService.adjustStock(
      productId,
      delta,
      `Manual inventory calibration (${delta > 0 ? `+${delta}` : delta}) by store director.`
    );
    if (updated) {
      toast.success(`Stock for "${name}" updated to ${updated.stock} units.`);
      loadData();
    }
  };

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'low') return p.stock > 0 && p.stock <= 5;
    if (filterMode === 'out') return p.stock === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">
          Inventory & Stock Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Warehouse balances, stock adjustments, and replenishment audit trail
        </p>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Units on Hand
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-white">{totalStockUnits}</div>
          <span className="text-[11px] text-slate-500">Across all SKUs in inventory</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Low Stock Alerts (≤ 5 units)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {lowStockProducts.length}
          </div>
          <span className="text-[11px] text-slate-500">Replenishment orders recommended</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Depleted / Out of Stock
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            {outOfStockProducts.length}
          </div>
          <span className="text-[11px] text-slate-500">Back-ordered or pending fabrication</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search SKU or product title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterMode === 'low'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Low Stock ({lowStockProducts.length})
          </button>
          <button
            onClick={() => setFilterMode('out')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterMode === 'out'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Depleted ({outOfStockProducts.length})
          </button>
        </div>
      </div>

      {/* Main Stock Adjustment Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Masterpiece / Object</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Available</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Calibration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-9 h-9 object-cover rounded bg-slate-800 border border-slate-700" />
                      <div>
                        <span className="font-semibold text-white block">{p.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">${p.price}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                  <td className="py-3 px-4">{p.category}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                    {p.stock}
                  </td>
                  <td className="py-3 px-4">
                    {p.stock === 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-rose-950 text-rose-400 border border-rose-800">
                        Out of Stock
                      </span>
                    ) : p.stock <= 5 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-950 text-amber-400 border border-amber-800">
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Healthy Buffer
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
                      <button
                        onClick={() => handleAdjust(p.id, -1, p.name)}
                        disabled={p.stock <= 0}
                        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded disabled:opacity-30"
                        title="Reduce stock by 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-mono font-bold text-white text-xs">{p.stock}</span>
                      <button
                        onClick={() => handleAdjust(p.id, +1, p.name)}
                        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
                        title="Increase stock by 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAdjust(p.id, +10, p.name)}
                        className="px-2 py-0.5 ml-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-indigo-300 rounded font-semibold"
                        title="Add +10 batch shipment"
                      >
                        +10 Batch
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock History Log */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <span>Recent Inventory Transaction Ledger</span>
        </h3>

        <div className="space-y-2">
          {logs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-white block">{log.productName}</span>
                <span className="text-slate-400 text-[11px]">{log.reason}</span>
              </div>
              <div className="text-right font-mono">
                <span
                  className={`font-bold block ${
                    log.changeAmount > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount} units
                </span>
                <span className="text-[10px] text-slate-500">{log.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
