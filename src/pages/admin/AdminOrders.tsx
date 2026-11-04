import React, { useEffect, useState } from 'react';
import {
  Search,
  Eye,
  Truck,
  CheckCircle,
  X,
  Filter,
  Clock,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const toast = useToast();

  const loadOrders = async () => {
    setLoading(true);
    const data = await orderService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const updated = await orderService.updateOrderStatus(
      orderId,
      newStatus,
      `Order status updated to ${newStatus.replace('_', ' ')} by store admin.`
    );
    if (updated) {
      toast.success(`Order #${updated.orderNumber} updated to ${newStatus.replace('_', ' ')}.`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      loadOrders();
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Order Fulfillment Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track client reservations, carrier dispatches, and fulfillment progress
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by Order ID, client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 text-xs py-2 px-3 rounded-lg focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <span className="text-xs text-slate-500 font-mono">{filteredOrders.length} orders</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">{ord.customerName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{ord.customerEmail}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{ord.createdAt}</td>
                  <td className="py-3.5 px-4 font-mono">{ord.items.length} units</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${ord.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize text-emerald-400 font-medium font-mono text-[11px]">
                      {ord.paymentMethod.toUpperCase()} (Paid)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      className={`text-[10px] font-semibold uppercase py-1 px-2 rounded border focus:outline-none cursor-pointer ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : ord.status === 'shipped'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          : ord.status === 'cancelled'
                          ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      <option value="placed">Placed</option>
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Order Inspection</span>
                <h2 className="text-base font-bold text-white font-mono">{selectedOrder.orderNumber}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Fulfillment Status</span>
                <span className="font-semibold text-white uppercase">{selectedOrder.status.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Tracking Number</span>
                <span className="font-mono text-emerald-400">{selectedOrder.trackingNumber || 'Pending Courier Scan'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Delivery Target</span>
                <span className="font-mono text-white">{selectedOrder.estimatedDelivery}</span>
              </div>
            </div>

            {/* Consignee & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <h4 className="font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Consignee Details</span>
                </h4>
                <p className="font-semibold text-slate-200">{selectedOrder.customerName}</p>
                <p className="text-slate-400">{selectedOrder.customerEmail}</p>
                <p className="text-slate-400 font-mono">{selectedOrder.customerPhone}</p>
                <div className="mt-2 text-slate-300">
                  <p>{selectedOrder.shippingAddress.street} {selectedOrder.shippingAddress.apartment}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <h4 className="font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payment & Financials</span>
                </h4>
                <div className="space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="text-white font-mono uppercase">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">${selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Voucher Savings:</span>
                      <span className="font-mono">-${selectedOrder.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Charges:</span>
                    <span className="font-mono">${selectedOrder.shippingFee}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                    <span>Total Paid:</span>
                    <span className="font-mono">${selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-3">
                Items in Consignment ({selectedOrder.items.length})
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-10 object-cover rounded bg-slate-900 border border-slate-800" />
                      <div>
                        <span className="font-semibold text-white block">{item.name}</span>
                        <span className="text-slate-400 font-mono">
                          Qty: {item.quantity} {item.selectedColor ? `· ${item.selectedColor}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Audit & Status Log</span>
              </h4>
              <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                {selectedOrder.statusHistory.map((h, i) => (
                  <div key={i} className="flex justify-between gap-4 text-slate-400 pb-1 border-b border-slate-900 last:border-b-0">
                    <span>{h.note}</span>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
