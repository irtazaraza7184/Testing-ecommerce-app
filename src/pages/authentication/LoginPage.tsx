import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    }
  };

  const loginDemoCustomer = async () => {
    setLoading(true);
    await switchRole('customer');
    setLoading(false);
    navigate('/account');
  };

  const loginDemoAdmin = async () => {
    setLoading(true);
    await switchRole('admin');
    setLoading(false);
    navigate('/admin');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold font-display text-slate-950 tracking-tight">
            AURA
          </Link>
          <h1 className="text-lg font-bold text-slate-900 mt-3">Welcome to Your Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your orders, saved addresses, and private wishlist
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-center">
            Instant Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={loginDemoCustomer}
              className="py-2 px-2.5 bg-white border border-slate-300 rounded-md text-[11px] font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={loginDemoAdmin}
              className="py-2 px-2.5 bg-slate-900 text-white rounded-md text-[11px] font-semibold hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-300" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="eleanor.vance@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-slate-500 hover:text-slate-900 underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-semibold text-slate-900 hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
