import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/common/CartDrawer';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { Product } from '../types';

export const StoreLayout: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-slate-900 selection:bg-slate-900 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet context={{ openQuickView: setQuickViewProduct }} />
      </main>
      <Footer />
      <CartDrawer />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
