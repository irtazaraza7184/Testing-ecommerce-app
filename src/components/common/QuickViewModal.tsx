import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Heart, Check, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
  );
  const [quantity, setQuantity] = useState(1);

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-900 bg-white/80 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Side */}
          <div className="bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white border border-slate-200/80 mb-4">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 shrink-0 ${
                      selectedImage === img ? 'border-slate-900' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="uppercase tracking-wider font-semibold text-slate-400">
                  {product.brand}
                </span>
                <span>·</span>
                <span>{product.category}</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Rating & Stock */}
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1 text-slate-700">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount} reviews)</span>
                </div>
                <span>·</span>
                <span className={product.inStock ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>
                  {product.inStock ? `In Stock (${product.stock} available)` : 'Back-ordered'}
                </span>
              </div>

              {/* Pricing */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  ${product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Save {product.discountPercentage}%
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-800 block mb-2">
                    Color: <span className="font-normal text-slate-600">{selectedColor}</span>
                  </label>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedColor === color.name
                            ? 'border-slate-900 ring-2 ring-slate-900/20'
                            : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColor === color.name && (
                          <Check
                            className={`w-3.5 h-3.5 ${
                              color.hex === '#18181b' || color.hex === '#09090b' || color.hex === '#1e293b'
                                ? 'text-white'
                                : 'text-slate-900'
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-800 block mb-2">
                    Size: <span className="font-normal text-slate-600">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                          selectedSize === size
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-800">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-md">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-mono font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 py-2.5 px-4 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isFavorited
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <Link
                to={`/product/${product.id}`}
                onClick={onClose}
                className="text-xs font-medium text-center text-slate-600 hover:text-slate-900 py-1 flex items-center justify-center gap-1"
              >
                <span>View Full Product Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
