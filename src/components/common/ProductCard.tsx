import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="group relative flex flex-col bg-white rounded-lg border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300">
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        {/* Subtle status tag if low stock or featured */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {product.discountPercentage ? (
            <span className="text-[11px] font-semibold text-slate-900 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs">
              Save {product.discountPercentage}%
            </span>
          ) : null}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50/95 border border-amber-200/80 px-2 py-0.5 rounded">
              Only {product.stock} left
            </span>
          )}
          {!product.inStock && (
            <span className="text-[10px] font-medium text-rose-700 bg-rose-50/95 border border-rose-200/80 px-2 py-0.5 rounded">
              Back-order
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-xs transition-all duration-200 ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 shadow-xs'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-xs'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Product Image with Fallback */}
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          {!imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
                {product.brand}
              </span>
              <span className="text-sm font-semibold text-slate-700 mt-1 line-clamp-1">
                {product.name}
              </span>
            </div>
          )}
        </Link>

        {/* Hover Quick Action Bar */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white/95 backdrop-blur-xs text-xs font-semibold text-slate-900 rounded-md shadow-sm hover:bg-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          )}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={!product.inStock}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 text-xs font-semibold text-white rounded-md shadow-sm hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata with · separator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <span className="uppercase tracking-wider font-medium text-slate-400">
              {product.brand}
            </span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>

          <Link to={`/product/${product.id}`} className="block group-hover:text-slate-700">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Price & Rating Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-slate-900 text-base font-mono tabular-nums">
              ${product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium font-mono tabular-nums">{product.rating}</span>
            <span className="text-slate-400">({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
