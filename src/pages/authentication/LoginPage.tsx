import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const success = await loginWithGoogle();
    setLoading(false);
    if (success) {
      navigate('/account');
    }
  };

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

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
            or email
          </span>
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
