import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Prop Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Carbon Neutral Shipping
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Complimentary over $150</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                30-Day In-Home Trial
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Prepaid return labels</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Lifetime Craft Guarantee
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Master joinery & titanium</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Headphones className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Concierge Support
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct design consultation</p>
            </div>
          </div>
        </div>

        {/* 4 Editorial Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 pr-4">
            <Link to="/" className="text-2xl font-bold font-display text-white tracking-tight">
              AURA
            </Link>
            <p className="text-xs text-slate-400 mt-3 max-w-sm leading-relaxed">
              Curating tactile luxury, acoustic neutrality, and architectural longevity. Every object
              in our catalogue is sourced from independent ateliers and tested for a lifetime of daily use.
            </p>
            <div className="mt-4 text-xs text-slate-500">
              San Francisco · Copenhagen · Tokyo
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/shop?category=audio" className="hover:text-white transition-colors">
                  Acoustics & Studio
                </Link>
              </li>
              <li>
                <Link to="/shop?category=furniture" className="hover:text-white transition-colors">
                  Architectural Furniture
                </Link>
              </li>
              <li>
                <Link to="/shop?category=horology" className="hover:text-white transition-colors">
                  Precision Horology
                </Link>
              </li>
              <li>
                <Link to="/shop?category=lighting" className="hover:text-white transition-colors">
                  Ambient Lighting
                </Link>
              </li>
              <li>
                <Link to="/shop?category=apparel" className="hover:text-white transition-colors">
                  Technical Apparel
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Client Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  Account Dashboard
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  White Glove Delivery
                </span>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white text-indigo-400 transition-colors">
                  Store Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              The Dispatch
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Curated architectural previews, rare mechanical drops, and seasonal member offers.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800">
                <Check className="w-4 h-4 shrink-0" />
                <span>Thank you. You are enrolled in the private dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors shrink-0"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <p className="text-[10px] text-slate-500 mt-2">
              We respect your quiet hours. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AURA Retail Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Sale</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
