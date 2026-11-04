import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromo, setShowPromo] = useState(true);

  const { totalCount, setIsCartOpen } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const { user, role, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Catalog', path: '/shop' },
    { label: 'Acoustics', path: '/shop?category=audio' },
    { label: 'Furniture', path: '/shop?category=furniture' },
    { label: 'Horology', path: '/shop?category=horology' },
    { label: 'Track Order', path: '/track-order' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Announcement Bar */}
      {showPromo && (
        <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-4 flex items-center justify-between transition-all">
          <div className="mx-auto flex items-center gap-2 tracking-wide">
            <span>Complimentary insured shipping on orders over $150</span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline text-slate-300">
              Use code <strong className="text-white font-mono">AURAWELCOME</strong> for 15% off
            </span>
          </div>
          <button
            onClick={() => setShowPromo(false)}
            className="text-slate-400 hover:text-white p-0.5"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation - 3 Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 font-display whitespace-nowrap shrink-0"
          >
            AURA
          </Link>
        </div>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path.includes('?') && location.search === link.path.split('?')[1]);
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-slate-950 border-b-2 border-slate-900 font-semibold'
                    : 'hover:text-slate-950'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Trigger */}
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products, materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-44 sm:w-64 pl-8 pr-7 py-1.5 text-xs bg-slate-100 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Search catalog"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-2 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Saved items"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-mono font-medium flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-mono font-medium flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>

          {/* User Account / Profile */}
          <Link
            to="/account"
            className="hidden sm:flex items-center gap-1.5 p-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            <span className="truncate max-w-[80px]">{user ? user.name.split(' ')[0] : 'Sign In'}</span>
          </Link>

          {/* Admin Switcher Shortcut */}
          <button
            onClick={() => {
              if (role === 'customer') {
                switchRole('admin');
                navigate('/admin');
              } else {
                navigate('/admin');
              }
            }}
            className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
            title="Open Admin Management Dashboard"
          >
            <Shield className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden lg:inline">Admin</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 rounded-lg border border-slate-200 focus:outline-none"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </form>

          <div className="flex flex-col gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md flex items-center justify-between"
            >
              <span>Account & Orders</span>
              <span className="text-xs text-slate-400 font-mono">{user?.name}</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                switchRole('admin');
                navigate('/admin');
              }}
              className="py-2 px-3 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md text-left flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Go to Admin Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
