import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Tag,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartPage: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    shippingFee,
    taxAmount,
    totalAmount,
    freeShippingThreshold,
    amountUntilFreeShipping,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setApplying(true);
    await applyCoupon(couponCodeInput.trim());
    setApplying(false);
    setCouponCodeInput('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-display mb-2">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8">
          Explore our acoustic monitors, Scandinavian furniture, and mechanical timepieces to begin your collection.
        </p>
        <Link
          to="/shop"
          className="py-3 px-8 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
            Shopping Bag
          </h1>
          <span className="text-xs text-slate-500 font-mono">
            {items.reduce((s, i) => s + i.quantity, 0)} items in your reservation
          </span>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Items Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Banner */}
          <div className="p-4 bg-slate-100/80 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            {amountUntilFreeShipping > 0 ? (
              <span>
                Add <strong className="font-mono text-slate-900">${amountUntilFreeShipping}</strong> more to unlock{' '}
                <strong className="text-slate-900">Complimentary Courier Shipping</strong>
              </span>
            ) : (
              <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Complimentary insured delivery unlocked!
              </span>
            )}
            <span className="font-mono text-slate-500 font-medium">
              ${subtotal} / ${freeShippingThreshold}
            </span>
          </div>

          {/* Itemized Table */}
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Link to={`/product/${item.productId}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg bg-slate-100 border border-slate-200"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    {item.brand}
                  </span>
                  <Link
                    to={`/product/${item.productId}`}
                    className="text-sm font-semibold text-slate-900 hover:text-slate-700 block truncate"
                  >
                    {item.name}
                  </Link>

                  <div className="flex gap-3 text-xs text-slate-500 mt-1">
                    {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                  </div>

                  <div className="mt-2 text-xs font-mono text-slate-500">
                    Unit: ${item.price.toLocaleString()}
                  </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-mono font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 text-xs"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="text-sm font-bold text-slate-900 font-mono tabular-nums block">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/shop"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-600" />
              <span>Promotional Voucher</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <div>
                    <strong className="font-mono">{appliedCoupon.code}</strong>
                    <span className="block text-[11px] text-emerald-700">
                      {appliedCoupon.discountPercentage
                        ? `${appliedCoupon.discountPercentage}% Discount Applied`
                        : `$${appliedCoupon.fixedAmount} Discount Applied`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-emerald-700 hover:text-rose-600"
                  aria-label="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. AURAWELCOME"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs uppercase font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={applying || !couponCodeInput.trim()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  {applying ? '...' : 'Apply'}
                </button>
              </form>
            )}

            <div className="mt-3 text-[11px] text-slate-400">
              Try code <span className="font-mono text-slate-700 font-semibold">AURAWELCOME</span> (15% off) or{' '}
              <span className="font-mono text-slate-700 font-semibold">ARCHITECT100</span> ($100 off).
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-slate-900">
                  ${subtotal.toLocaleString()}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promotional Savings</span>
                  <span className="font-mono">-${couponDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-mono text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase text-[10px]">
                      Complimentary
                    </span>
                  ) : (
                    `$${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax (7.5%)</span>
                <span className="font-mono text-slate-900">
                  ${taxAmount.toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Total Payable</span>
                <span className="font-mono font-bold text-xl text-slate-950 tabular-nums">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 bg-slate-900 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted 256-bit SSL transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
