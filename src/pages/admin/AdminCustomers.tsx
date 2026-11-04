import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Eye, X, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { Customer } from '../../types';
import { customerService } from '../../services/customerService';
import { useToast } from '../../context/ToastContext';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const toast = useToast();

  const loadCustomers = async () => {
    setLoading(true);
    const data = await customerService.getCustomers();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: 'active' | 'suspended') => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const updated = await customerService.updateCustomerStatus(id, nextStatus);
    if (updated) {
      toast.info(`Customer ${updated.name} status updated to: ${nextStatus.toUpperCase()}`);
      loadCustomers();
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Client Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage collector relationships, VIP accounts, and account access permissions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search clients by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-mono">{filtered.length} client records</span>
      </div>

      {/* Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Enrolled Date</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center border border-slate-700">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{c.name}</span>
                        <span className="text-[11px] text-slate-500">{c.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{c.phone}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{c.registeredDate}</td>
                  <td className="py-3.5 px-4 font-mono">{c.totalOrders} dispatches</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${c.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        c.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => toggleStatus(c.id, c.status)}
                        className={`py-1 px-2.5 rounded text-[11px] font-medium transition-colors ${
                          c.status === 'active'
                            ? 'bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400'
                            : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                        }`}
                      >
                        {c.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Inspection Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Collector Profile Card</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{selectedCustomer.name}</h3>
                <span className="text-xs text-slate-400">{selectedCustomer.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Total Orders</span>
                <span className="font-mono font-bold text-white">{selectedCustomer.totalOrders}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Lifetime Value</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${selectedCustomer.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Client since {selectedCustomer.registeredDate}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="py-1.5 px-4 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
