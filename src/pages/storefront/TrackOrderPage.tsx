import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('orderId') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    const result = await orderService.getOrderByNumber(term.trim());
    setOrder(result);
    setLoading(false);
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    } else {
      // Default show first demo order so page is immediately rich and interactive
      orderService.getOrders().then((all) => {
        if (all.length > 0) {
          setOrder(all[0]);
          setSearched(true);
        }
      });
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ orderId: searchQuery.trim() });
      performSearch(searchQuery);
    }
  };

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Real-time Fulfillment
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
          Track Your Dispatch
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Enter your order identifier or tracking code for live transit updates and estimated delivery.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto mb-12 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. AUR-2026-1042"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs font-mono uppercase bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
        <button
          type="submit"
          className="py-2.5 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0 shadow-xs"
        >
          {loading ? 'Searching...' : 'Locate Order'}
        </button>
      </form>

      {/* Search Result */}
      {order ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {/* Header Bar */}
          <div className="p-6 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Order Reference
              </span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {order.orderNumber}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Courier: <strong className="text-slate-900">{order.trackingNumber || 'FedEx Priority'}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-slate-900 text-white">
                <Truck className="w-3.5 h-3.5" />
                <span>{order.status.replace('_', ' ')}</span>
              </span>
            </div>
          </div>

          {/* Visual Progress Stepper */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Milestone Progression
            </h3>

            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                <div
                  className="h-full bg-slate-900 transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      0,
                      (currentStepIndex / (STATUS_STEPS.length - 1)) * 100
                    )}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex sm:flex-col items-center gap-2 text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                          isDone
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-medium text-left sm:text-center ${
                          isCurrent
                            ? 'text-slate-950 font-bold'
                            : isDone
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activity Log / Timeline */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Transit Event Log</span>
              </h4>

              <div className="space-y-4">
                {order.statusHistory.map((hist, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block capitalize">
                        {hist.status.replace('_', ' ')}
                      </span>
                      <p className="text-slate-600 mt-0.5">{hist.note}</p>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        {hist.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Consignee Details</span>
                </h4>
                <p className="text-slate-800 font-semibold">{order.shippingAddress.fullName}</p>
                <p className="text-slate-600">
                  {order.shippingAddress.street} {order.shippingAddress.apartment}
                </p>
                <p className="text-slate-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-slate-500 font-mono mt-1">{order.shippingAddress.phone}</p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Expected Delivery:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {order.estimatedDelivery}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : searched && !loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Order Not Found</h3>
          <p className="text-xs text-slate-500 mb-4">
            No active dispatch matching "{searchQuery}". Check the identifier on your confirmation email.
          </p>
          <button
            onClick={() => performSearch('AUR-2026-1042')}
            className="text-xs font-semibold text-slate-900 underline"
          >
            Load Sample Tracking (AUR-2026-1042)
          </button>
        </div>
      ) : null}
    </div>
  );
};
