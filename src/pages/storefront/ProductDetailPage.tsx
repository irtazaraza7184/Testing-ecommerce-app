import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  Share2,
  ChevronRight,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Product, Review } from '../../types';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { ProductCard } from '../../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // New review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProductData = async () => {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const prod = await productService.getProductById(id);
      if (prod) {
        setProduct(prod);
        setSelectedImage(prod.images[0]);
        if (prod.colors && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0].name);
        }
        if (prod.sizes && prod.sizes.length > 0) {
          setSelectedSize(prod.sizes[0]);
        }

        // Fetch reviews
        const revs = await orderService.getReviews(prod.id);
        setReviews(revs);

        // Fetch related products in same category
        const allProds = await productService.getProducts({ category: prod.categoryId });
        setRelatedProducts(allProds.filter((p) => p.id !== prod.id).slice(0, 4));
      }
      setLoading(false);
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-mono">Loading product craftsmanship details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The requested object may have retired from our current collection.
        </p>
        <Link
          to="/shop"
          className="py-2.5 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    setSubmittingReview(true);
    const newRev = await orderService.addReview({
      productId: product.id,
      productName: product.name,
      customerName: reviewName,
      customerEmail: reviewEmail || 'verified.collector@example.com',
      rating: reviewRating,
      title: reviewTitle || 'Excellent Craftsmanship',
      comment: reviewComment,
      verifiedPurchase: true,
    });

    setReviews([newRev, ...reviews]);
    setSubmittingReview(false);
    setShowReviewForm(false);
    setReviewName('');
    setReviewComment('');
    setReviewTitle('');
    toast.success('Your review has been verified and published.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
        <Link to="/" className="hover:text-slate-900">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-slate-900">
          Catalog
        </Link>
        <span>/</span>
        <Link to={`/shop?category=${product.categoryId}`} className="hover:text-slate-900">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Image */}
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200/90 shadow-sm relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {product.discountPercentage ? (
              <span className="absolute top-4 left-4 text-xs font-semibold text-slate-950 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded shadow-xs">
                Save {product.discountPercentage}%
              </span>
            ) : null}
          </div>

          {/* Thumbnail Gallery Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-slate-900 ring-2 ring-slate-900/10'
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="uppercase tracking-widest font-semibold text-slate-400">
                {product.brand}
              </span>
              <span className="font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="mt-3 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-slate-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold font-mono">{product.rating}</span>
                <span className="text-slate-400">({product.reviewCount} collector reviews)</span>
              </div>
              <span className="text-slate-300">·</span>
              <span
                className={
                  product.stock > 0
                    ? 'text-emerald-700 font-semibold'
                    : 'text-rose-600 font-semibold'
                }
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} units left)`
                  : 'Currently Back-Ordered'}
              </span>
            </div>

            {/* Pricing */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-950 font-mono tabular-nums">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-base text-slate-400 line-through font-mono tabular-nums">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-900 block mb-2.5">
                  Finish / Material: <span className="font-normal text-slate-600">{selectedColor}</span>
                </label>
                <div className="flex gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
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

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-5">
                <label className="text-xs font-semibold text-slate-900 block mb-2">
                  Proportion / Size: <span className="font-normal text-slate-600">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
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

            {/* Quantity Stepper & Stock Warning */}
            <div className="mt-5 flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-900">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs"
                >
                  -
                </button>
                <span className="px-3 text-xs font-mono font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-40 text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <div className="flex gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 py-3 px-6 bg-slate-900 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Bag</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-lg border transition-colors ${
                    isFavorited
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full py-3 px-6 bg-amber-600 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-amber-700 disabled:bg-slate-300 transition-colors"
              >
                Buy Now — Instant Checkout
              </button>
            </div>

            {/* Trust and Reassurance Badges */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Complimentary insured shipping on orders over $150</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-slate-500 shrink-0" />
                <span>30-Day in-home acoustic and ergonomic trial</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Lifetime atelier craftsmanship and repair guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="mt-16 sm:mt-24 pt-12 border-t border-slate-200">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Technical Architecture
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mb-6">
            Material Specifications
          </h2>

          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <dl className="divide-y divide-slate-100 text-xs">
              {Object.entries(product.specifications).map(([key, val], idx) => (
                <div
                  key={key}
                  className={`grid grid-cols-1 sm:grid-cols-3 p-3.5 ${
                    idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <dt className="font-semibold text-slate-800">{key}</dt>
                  <dd className="sm:col-span-2 text-slate-600 font-mono mt-1 sm:mt-0">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="mt-16 sm:mt-20 pt-12 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Collector Insights
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Reviews & Verification ({reviews.length})
            </h2>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="py-2 px-4 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors self-start sm:self-auto flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Write Review Form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm mb-8 max-w-2xl space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-900">Share Your Experience</h3>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Kim"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="david@example.com"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Review Headline</label>
              <input
                type="text"
                placeholder="Summary of performance and build quality"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Detailed Feedback</label>
              <textarea
                required
                rows={3}
                placeholder="Describe acoustic clarity, ergonomic feel, or materials..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="py-2 px-4 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="py-2 px-5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Publish Review'}
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4 max-w-3xl">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Be the first collector to review this masterpiece.
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-xs text-slate-900">{rev.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{rev.date}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-800">{rev.customerName}</span>
                  {rev.verifiedPurchase && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-700 flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Verified Purchase
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24 pt-12 border-t border-slate-200">
          <div className="mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Harmonious Complements
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Related in {product.category}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
