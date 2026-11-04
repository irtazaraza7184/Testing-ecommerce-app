import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, FileText } from 'lucide-react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderService.getOrderById(id).then((res) => {
      setOrder(res);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Retrieving order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Confirmation Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest block mb-1">
          Payment & Reservation Verified
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
          Thank you for your order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Confirmation and dispatch updates have been transmitted to{' '}
          <strong className="text-slate-800">{order?.customerEmail}</strong>.
        </p>
      </div>

      {order && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {/* Order Meta Bar */}
          <div className="p-6 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Order Identifier
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {order.orderNumber}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Estimated Delivery
              </span>
              <span className="text-xs font-semibold text-slate-800 font-mono">
                {order.estimatedDelivery}
              </span>
            </div>

            <Link
              to={`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`}
              className="py-2 px-4 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Dispatch</span>
            </Link>
          </div>

          {/* Items Summary */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Reserved Masterpieces ({order.items.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block">{item.name}</span>
                      <span className="text-slate-400 font-mono">
                        Qty: {item.quantity} {item.selectedColor ? `· ${item.selectedColor}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Details */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                Shipping Destination
              </h4>
              <p className="text-slate-700 font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-slate-600">
                {order.shippingAddress.street} {order.shippingAddress.apartment}
              </p>
              <p className="text-slate-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-slate-500 mt-1 font-mono">{order.shippingAddress.phone}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                Financial Summary
              </h4>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">${order.subtotal.toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Voucher ({order.couponCode})</span>
                    <span className="font-mono">-${order.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping ({order.shippingMethod})</span>
                  <span className="font-mono">${order.shippingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span className="font-mono">${order.taxAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Paid</span>
                  <span className="font-mono">${order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link
          to="/shop"
          className="py-3 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <span>Continue Exploring Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/account"
          className="py-3 px-6 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Account Orders</span>
        </Link>
      </div>
    </div>
  );
};
