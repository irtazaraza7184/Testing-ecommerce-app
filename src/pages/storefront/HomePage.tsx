import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/common/ProductCard';
import { HERO_BANNER_IMAGE } from '../../data/mockData';

interface OutletContextType {
  openQuickView: (product: Product) => void;
}

export const HomePage: React.FC = () => {
  const { openQuickView } = useOutletContext<OutletContextType>();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'featured' | 'trending'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [allProds, cats] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      setFeaturedProducts(allProds.filter((p) => p.isFeatured));
      setTrendingProducts(allProds.filter((p) => p.isTrending));
      setCategories(cats);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section - Architectural Presence */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_BANNER_IMAGE}
            alt="AURA architectural living"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 flex flex-col justify-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-300 mb-4">
              <span className="w-6 h-px bg-slate-400" />
              <span>Autumn / Winter 2026 Collection</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-display leading-[1.1] text-balance">
              Objects designed for acoustic purity & timeless space.
            </h1>

            <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Explore bespoke architectural furniture, beryllium-driver transducers, and precision Grade 5
              titanium timepieces engineered for an intentional lifestyle.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link
                to="/shop"
                className="py-3 px-6 bg-white text-slate-950 rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-lg"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop?category=furniture"
                className="py-3 px-6 bg-slate-800/80 backdrop-blur-xs text-white border border-slate-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Architectural Furniture
              </Link>
            </div>

            {/* Micro Credential Strip */}
            <div className="mt-12 pt-8 border-t border-slate-800/80 flex items-center gap-8 text-xs text-slate-400">
              <div>
                <span className="font-mono text-white font-semibold block text-sm sm:text-base">
                  100%
                </span>
                <span>FSC European Oak</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="font-mono text-white font-semibold block text-sm sm:text-base">
                  0.02%
                </span>
                <span>Harmonic Distortion</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="font-mono text-white font-semibold block text-sm sm:text-base">
                  30 Days
                </span>
                <span>In-Home Trial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Curated Categories Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Curated Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
              Explore by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative flex flex-col bg-white rounded-lg border border-slate-200/80 p-4 hover:border-slate-400 hover:shadow-sm transition-all"
            >
              <div className="aspect-square w-full rounded-md bg-slate-100 overflow-hidden mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-slate-700 line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {cat.itemCount} Objects
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured & Trending Collection Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Selected Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
              Masterpieces in Stock
            </h2>
          </div>

          {/* Interactive Segmented Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'featured'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Featured Works
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'trending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trending Drops
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(activeTab === 'featured' ? featuredProducts : trendingProducts).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={openQuickView}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 py-3 px-8 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <span>Browse Complete 2026 Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 4. Atelier Spotlight & Craftsmanship Story */}
      <section className="bg-slate-100/80 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Award className="w-4 h-4 text-slate-700" />
                <span>The AURA Production Standard</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight text-balance">
                Zero synthetic composites. Sourced once, cherished for decades.
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Modern commerce is saturated with planned obsolescence. At AURA, every chair, transducer,
                and timepiece is assembled from repairable honest materials: raw titanium, European white oak,
                cast bronze, and unbleached Belgian linen.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="border-t border-slate-300 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900">Repairable Architecture</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Every screw, component, and cushion is fully modular and replaceable.
                  </p>
                </div>
                <div className="border-t border-slate-300 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900">Precision Calibrated</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Audio monitors and chronographs undergo 72 hours of bench testing before dispatch.
                  </p>
                </div>
              </div>

              <div>
                <Link
                  to="/shop?category=furniture"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900 hover:text-slate-700 pt-2"
                >
                  <span>Explore Atelier Furniture Series</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-xl border border-slate-200">
              <img
                src={HERO_BANNER_IMAGE}
                alt="Atelier craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Attributable Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Verified Collectors & Acousticians
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            In Praise of Tactile Precision
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "The Sonus Pure ANC headphones replaced my desktop electrostatic rig. The beryllium driver
              distortion is completely imperceptible, even on complex orchestral climaxes."
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 block">David K.</strong>
                <span className="text-slate-400">Mastering Engineer, SoundRecord</span>
              </div>
              <span className="font-mono text-slate-400">5.0 ★</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "The Nordic Sculptural Oak Lounge Chair anchors our architectural studio. The solid wood
              grain matching and Belgian linen breathability are museum-grade."
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 block">Clara Lindqvist</strong>
                <span className="text-slate-400">Principal Architect, Lindqvist Studio</span>
              </div>
              <span className="font-mono text-slate-400">5.0 ★</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "The Kallisto Grade 5 titanium chronograph pusher action is sharper than watches five times
              its price. It has not left my wrist for two months."
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 block">Marcus Sterling</strong>
                <span className="text-slate-400">Horology Collector, New York</span>
              </div>
              <span className="font-mono text-slate-400">5.0 ★</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
