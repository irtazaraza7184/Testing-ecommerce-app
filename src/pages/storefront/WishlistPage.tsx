import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';

export const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = async (productId: string) => {
    const product = await productService.getProductById(productId);
    if (product) {
      addToCart(product, 1);
      removeFromWishlist(productId);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-display mb-2">
          Your Saved Wishlist is Empty
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8">
          Save your favourite Scandinavian armchairs, acoustic monitors, and titanium timepieces to revisit anytime.
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
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
            Saved Objects
          </h1>
          <span className="text-xs text-slate-500 font-mono">
            {items.length} items currently in your private wishlist
          </span>
        </div>
        <Link
          to="/shop"
          className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1.5"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
              <Link to={`/product/${item.productId}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <button
                onClick={() => removeFromWishlist(item.productId)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-600 shadow-xs hover:bg-white transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
                  {item.brand}
                </span>
                <Link
                  to={`/product/${item.productId}`}
                  className="text-sm font-semibold text-slate-900 hover:text-slate-700 line-clamp-1 block"
                >
                  {item.name}
                </Link>
                <span className="text-xs text-slate-500 mt-1 block font-mono">
                  ${item.price.toLocaleString()}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleMoveToBag(item.productId)}
                  disabled={!item.inStock}
                  className="w-full py-2 px-3 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Bag</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
