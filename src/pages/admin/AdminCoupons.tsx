import React, { useEffect, useState } from 'react';
import { Plus, Tag, Trash2, Check, X, Calendar, DollarSign, Percent } from 'lucide-react';
import { Coupon } from '../../types';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState<number>(15);
  const [minPurchase, setMinPurchase] = useState<number>(100);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(200);

  const toast = useToast();

  const loadCoupons = async () => {
    setLoading(true);
    const data = await orderService.getCoupons();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    await orderService.createCoupon({
      code: code.trim().toUpperCase(),
      discountPercentage: type === 'percent' ? value : undefined,
      fixedAmount: type === 'fixed' ? value : undefined,
      minPurchase,
      expiryDate,
      usageLimit,
      isActive: true,
    });

    toast.success(`Coupon code ${code.toUpperCase()} created successfully.`);
    setIsModalOpen(false);
    setCode('');
    loadCoupons();
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    await orderService.updateCoupon(coupon.id, { isActive: !coupon.isActive });
    toast.info(`Coupon ${coupon.code} is now ${!coupon.isActive ? 'Active' : 'Deactivated'}.`);
    loadCoupons();
  };

  const handleDelete = async (id: string, code: string) => {
    await orderService.deleteCoupon(id);
    toast.info(`Coupon ${code} removed.`);
    loadCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Promotional Coupons & Vouchers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure discount codes, seasonal promotions, and minimum order thresholds
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Min. Order</th>
                <th className="py-3 px-4">Usage Stats</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-mono font-bold text-white text-sm">{c.code}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {c.discountPercentage ? `${c.discountPercentage}% OFF` : `$${c.fixedAmount} OFF`}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">${c.minPurchase}</td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-white font-semibold">{c.timesUsed}</span>
                    <span className="text-slate-500"> / {c.usageLimit} redeemed</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{c.expiryDate}</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleCouponStatus(c)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase transition-colors ${
                        c.isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Create Promotional Voucher</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIPSUMMER"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 font-mono uppercase bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Value ({type === 'percent' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={type === 'percent' ? 90 : 500}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min. Purchase ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Usage Cap</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
