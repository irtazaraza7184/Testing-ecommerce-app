import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';
import {
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  Search,
  RotateCcw,
  Star,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { productService, ProductFilterParams } from '../../services/productService';
import { ProductCard } from '../../components/common/ProductCard';

interface OutletContextType {
  openQuickView: (product: Product) => void;
}

export const ShopPage: React.FC = () => {
  const { openQuickView } = useOutletContext<OutletContextType>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filters state initialized from URL params
  const categoryParam = searchParams.get('category') || 'all';
  const brandParam = searchParams.get('brand') || 'all';
  const sortParam = (searchParams.get('sort') as ProductFilterParams['sort']) || 'featured';
  const searchParam = searchParams.get('q') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const minPriceParam = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 3000;
  const ratingParam = searchParams.get('rating') ? Number(searchParams.get('rating')) : 0;

  // Fetch categories once
  useEffect(() => {
    productService.getCategories().then(setCategories);
  }, []);

  // Fetch products whenever searchParams change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      const items = await productService.getProducts({
        category: categoryParam !== 'all' ? categoryParam : undefined,
        brand: brandParam !== 'all' ? brandParam : undefined,
        search: searchParam,
        inStockOnly: inStockParam,
        minPrice: minPriceParam > 0 ? minPriceParam : undefined,
        maxPrice: maxPriceParam < 3000 ? maxPriceParam : undefined,
        rating: ratingParam > 0 ? ratingParam : undefined,
        sort: sortParam,
      });
      setProducts(items);
      setLoading(false);
    };

    fetchFilteredProducts();
  }, [categoryParam, brandParam, sortParam, searchParam, inStockParam, minPriceParam, maxPriceParam, ratingParam]);

  // Unique brands from total products for filter checklist
  const allBrands = useMemo(() => {
    return ['Sonus Acoustics', 'AURA Atelier', 'Kallisto Horology', 'Kinetic Technical', 'AURA Botanical'];
  }, []);

  const updateFilter = (key: string, value: string | number | boolean | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'all' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    categoryParam !== 'all' ||
    brandParam !== 'all' ||
    searchParam !== '' ||
    inStockParam ||
    minPriceParam > 0 ||
    maxPriceParam < 3000 ||
    ratingParam > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link to="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Catalog</span>
          {categoryParam !== 'all' && (
            <>
              <span>/</span>
              <span className="capitalize text-slate-900 font-medium">{categoryParam}</span>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight">
              {categoryParam === 'all'
                ? 'Complete Collection'
                : categories.find((c) => c.slug === categoryParam || c.id === categoryParam)?.name ||
                  categoryParam}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Precision audio, European white oak furniture, mechanical chronographs, and architectural goods.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 py-2 px-3.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative inline-block">
              <select
                value={sortParam}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="featured">Sort: Featured</option>
                <option value="newest">Sort: Newest Arrivals</option>
                <option value="best-selling">Sort: Best Selling</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Active filters:</span>
          {categoryParam !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-800">
              Category: {categoryParam}
              <button onClick={() => updateFilter('category', null)}>
                <X className="w-3 h-3 text-slate-500 hover:text-slate-900" />
              </button>
            </span>
          )}
          {brandParam !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-800">
              Brand: {brandParam}
              <button onClick={() => updateFilter('brand', null)}>
                <X className="w-3 h-3 text-slate-500 hover:text-slate-900" />
              </button>
            </span>
          )}
          {searchParam && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-800">
              Query: "{searchParam}"
              <button onClick={() => updateFilter('q', null)}>
                <X className="w-3 h-3 text-slate-500 hover:text-slate-900" />
              </button>
            </span>
          )}
          {inStockParam && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-800">
              In Stock Only
              <button onClick={() => updateFilter('inStock', false)}>
                <X className="w-3 h-3 text-slate-500 hover:text-slate-900" />
              </button>
            </span>
          )}
          {ratingParam > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-800">
              {ratingParam}+ Stars
              <button onClick={() => updateFilter('rating', null)}>
                <X className="w-3 h-3 text-slate-500 hover:text-slate-900" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 ml-2 flex items-center gap-1 underline underline-offset-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-lg border border-slate-200/80 h-fit sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Refine Search
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-2">Category</h4>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter('category', 'all')}
                className={`w-full text-left text-xs py-1.5 px-2 rounded flex justify-between ${
                  categoryParam === 'all'
                    ? 'font-semibold text-slate-950 bg-slate-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Disciplines</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter('category', c.slug)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded flex justify-between ${
                    categoryParam === c.slug
                      ? 'font-semibold text-slate-950 bg-slate-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{c.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 mb-2">Atelier & Brand</h4>
            <div className="space-y-1">
              {allBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer py-1"
                >
                  <input
                    type="radio"
                    name="brand"
                    checked={brandParam.toLowerCase() === brand.toLowerCase()}
                    onChange={() => updateFilter('brand', brand)}
                    className="rounded text-slate-900 focus:ring-slate-900"
                  />
                  <span>{brand}</span>
                </label>
              ))}
              {brandParam !== 'all' && (
                <button
                  onClick={() => updateFilter('brand', 'all')}
                  className="text-[11px] text-slate-400 hover:text-slate-700 underline mt-1"
                >
                  All Brands
                </button>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 mb-2">Price Cap ($ USD)</h4>
            <div className="space-y-2">
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={maxPriceParam}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-mono text-slate-600">
                <span>$0</span>
                <span className="font-semibold text-slate-900">Up to ${maxPriceParam}</span>
              </div>
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockParam}
                onChange={(e) => updateFilter('inStock', e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>In-stock only for immediate dispatch</span>
            </label>
          </div>

          {/* Minimum Rating */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 mb-2">Customer Rating</h4>
            <div className="space-y-1">
              {[4.8, 4.5, 4.0].map((star) => (
                <button
                  key={star}
                  onClick={() => updateFilter('rating', ratingParam === star ? 0 : star)}
                  className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded ${
                    ratingParam === star ? 'bg-slate-100 font-semibold text-slate-950' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{star} stars & above</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid & Results */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-slate-500">
              Showing <strong className="text-slate-900 font-mono">{products.length}</strong> objects
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
                  <div className="aspect-[4/3] bg-slate-100 rounded-md mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                No matching objects found
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Try widening your price range, clearing specific filters, or searching for other materials.
              </p>
              <button
                onClick={clearAllFilters}
                className="py-2.5 px-5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={openQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
