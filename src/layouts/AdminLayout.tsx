import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Archive,
  Tag,
  Star,
  BarChart3,
  Settings,
  Store,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();

  const menuItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Inventory', path: '/admin/inventory', icon: Archive },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-base tracking-tight font-display text-white">
            AURA Studio Admin
          </span>
        </div>
        <Link
          to="/"
          className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Live Store</span>
        </Link>
      </header>

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/80 p-5 flex flex-col justify-between transform transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand & Admin Badge */}
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-xl font-bold font-display text-white tracking-tight">
                AURA
              </span>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                Console
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Store Switcher */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between w-full p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition-colors border border-slate-800"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              <span>Back to Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            onClick={() => {
              switchRole('customer');
              navigate('/');
            }}
            className="w-full text-left p-2 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch to Customer View</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Admin</span>
            <span>/</span>
            <span className="text-white capitalize font-semibold">
              {location.pathname.replace('/admin', '').replace('/', '') || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Live Store Shortcut */}
            <Link
              to="/"
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Live Storefront</span>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors relative"
                aria-label="Admin alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 text-xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="font-bold text-white">System Alerts</span>
                    <span className="text-[10px] text-slate-400">3 new</span>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <p className="bg-slate-800/80 p-2 rounded border border-slate-700/50">
                      ⚡ <strong>Order #AUR-2026-1042</strong> marked as shipped by carrier FedEx.
                    </p>
                    <p className="bg-slate-800/80 p-2 rounded border border-slate-700/50">
                      ⚠️ Low stock alert for <strong>Nordic Sculptural Oak Chair</strong> (7 left).
                    </p>
                    <p className="bg-slate-800/80 p-2 rounded border border-slate-700/50">
                      ★ New 5-star review submitted for <strong>Kallisto Titanium Watch</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                JS
              </div>
              <span className="text-xs font-medium text-slate-200">Julian Sterling</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
