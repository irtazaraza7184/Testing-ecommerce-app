import React, { useState } from 'react';
import { Settings, Shield, Truck, DollarSign, CreditCard, RotateCcw, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../services/storageService';

export const AdminSettings: React.FC = () => {
  const toast = useToast();

  const [storeName, setStoreName] = useState('AURA — Modern Retail & Design');
  const [storeEmail, setStoreEmail] = useState('concierge@aura-retail.com');
  const [currency, setCurrency] = useState('USD ($)');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(150);
  const [expressShippingFee, setExpressShippingFee] = useState(18);
  const [taxRate, setTaxRate] = useState(7.5);

  const [enableCod, setEnableCod] = useState(true);
  const [enableCards, setEnableCards] = useState(true);
  const [enableBank, setEnableBank] = useState(true);

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Store configuration and fiscal thresholds saved.');
  };

  const handleResetDemo = () => {
    storage.resetToDefaults();
    toast.info('Storage state reset to master mock baseline. Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">
          Store Configuration & Operational Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Fiscal parameters, shipping rules, payment gateway toggles, and data maintenance
        </p>
      </div>

      {/* General Settings */}
      <form onSubmit={handleSaveStore} className="space-y-6">
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Store Profile & Fiscal Representation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Commercial Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Client Concierge Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Operating Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="USD ($)">USD ($) - United States Dollar</option>
                <option value="EUR (€)">EUR (€) - Eurozone</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Complimentary Shipping Threshold ($)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 font-mono bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Estimated Sales Tax (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 font-mono bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Customer Payment Rails (Demonstration)</span>
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/50 cursor-pointer">
              <div>
                <strong className="text-white block">Credit & Debit Cards (Visa / Mastercard / Amex)</strong>
                <span className="text-slate-400">Accept 256-bit simulated card authorization</span>
              </div>
              <input
                type="checkbox"
                checked={enableCards}
                onChange={(e) => setEnableCards(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/50 cursor-pointer">
              <div>
                <strong className="text-white block">Cash on Delivery (COD)</strong>
                <span className="text-slate-400">Courier collects exact funds upon delivery signature</span>
              </div>
              <input
                type="checkbox"
                checked={enableCod}
                onChange={(e) => setEnableCod(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/50 cursor-pointer">
              <div>
                <strong className="text-white block">Bank Wire Transfers</strong>
                <span className="text-slate-400">Direct institutional account transfer instructions</span>
              </div>
              <input
                type="checkbox"
                checked={enableBank}
                onChange={(e) => setEnableBank(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handleResetDemo}
            className="py-2.5 px-4 bg-slate-950 border border-slate-800 hover:border-rose-900 text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Database to Initial Seeding</span>
          </button>

          <button
            type="submit"
            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Operational Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
