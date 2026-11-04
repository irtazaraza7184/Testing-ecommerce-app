import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold font-display text-slate-950 tracking-tight">
            AURA
          </Link>
          <h1 className="text-lg font-bold text-slate-900 mt-3">Reset Account Access</h1>
          <p className="text-xs text-slate-500 mt-1">
            We will transmit a secure password-reset link to your verified email
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="font-semibold">Reset Instructions Transmitted</p>
            <p className="text-slate-600">
              If an account is associated with <strong>{email}</strong>, you will receive instructions in the next few minutes.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-900 hover:underline"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Transmit Reset Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
