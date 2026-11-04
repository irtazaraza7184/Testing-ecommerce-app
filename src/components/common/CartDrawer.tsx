import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    freeShippingThreshold,
    amountUntilFreeShipping,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingProgress = Math.min(
    100,
    Math.round(((freeShippingThreshold - amountUntilFreeShipping) / freeShippingThreshold) * 100)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs transition-opacity"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-800" />
            <h2 className="font-semibold text-slate-900 text-base">Shopping Bag</h2>
            <span className="text-xs text-slate-500 font-mono">
              ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex justify-between text-xs text-slate-700 mb-1.5">
            {amountUntilFreeShipping > 0 ? (
              <span>
                Add <span className="font-semibold font-mono">${amountUntilFreeShipping}</span> more for{' '}
                <strong className="text-slate-900">Complimentary Shipping</strong>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Unlocked Free Insured Courier Delivery!
              </span>
            )}
            <span className="font-mono text-slate-500">{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-slate-800 text-base mb-1">Your bag is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-5">
                Explore our curated catalog of precision audio, Scandinavian furniture, and timepieces.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
                className="py-2.5 px-5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-md object-cover bg-slate-100 border border-slate-200 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link
                        to={`/product/${item.productId}`}
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs font-semibold text-slate-900 hover:text-slate-700 line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-0.5 flex gap-2">
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="font-semibold text-slate-900 text-sm font-mono tabular-nums">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout Actions */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-bold text-slate-900 font-mono text-base tabular-nums">
                ${subtotal.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Shipping & taxes calculated at checkout. Free 30-day trial & warranty included.
            </p>

            <div className="flex gap-2 mt-1">
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="flex-1 py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 text-center hover:bg-slate-100 transition-colors"
              >
                View Full Bag
              </Link>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="flex-1 py-2.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
