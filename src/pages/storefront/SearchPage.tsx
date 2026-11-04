import React, { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight, X } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/common/ProductCard';

interface OutletContextType {
  openQuickView: (product: Product) => void;
}

export const SearchPage: React.FC = () => {
  const { openQuickView } = useOutletContext<OutletContextType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(queryParam);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchInput(queryParam);
    if (!queryParam.trim()) {
      setResults([]);
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      const items = await productService.getProducts({ search: queryParam });
      setResults(items);
      setLoading(false);
    };

    runSearch();
  }, [queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const suggestions = ['Studio Headphones', 'Oak Lounge Chair', 'Titanium Watch', 'Travertine Lantern', 'Merino Parka'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mb-4">
          Search the Collection
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search materials, products, brands, SKUs..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-9 py-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="py-3 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400">Popular searches:</span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => {
                setSearchInput(sug);
                setSearchParams({ q: sug });
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {queryParam && (
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <span className="text-xs text-slate-600">
            Found <strong className="font-mono text-slate-900">{results.length}</strong> matching objects for "
            <strong className="text-slate-900">{queryParam}</strong>"
          </span>
          <Link to="/shop" className="text-xs font-semibold text-slate-700 hover:text-slate-950">
            View All in Catalog →
          </Link>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-mono">Filtering atelier registry...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={openQuickView}
            />
          ))}
        </div>
      ) : queryParam ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center max-w-md mx-auto">
          <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Matching Objects</h3>
          <p className="text-xs text-slate-500 mb-6">
            We couldn't locate anything matching "{queryParam}". Try searching for categories like "furniture", "audio", or "titanium".
          </p>
          <Link
            to="/shop"
            className="py-2.5 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Explore Complete Collection
          </Link>
        </div>
      ) : null}
    </div>
  );
};
