import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WishlistItem, Product } from '../types';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

const WISHLIST_STORAGE_KEY = 'aura_wishlist';

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  moveToCart: (product: Product) => void;
  totalCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.productId === productId);
  };

  const toggleWishlist = (product: Product) => {
    const exists = isInWishlist(product.id);
    if (exists) {
      setItems((prev) => prev.filter((i) => i.productId !== product.id));
      toast.info(`Removed "${product.name}" from your saved items.`);
    } else {
      const newItem: WishlistItem = {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        inStock: product.inStock,
        rating: product.rating,
        category: product.category,
      };
      setItems((prev) => [...prev, newItem]);
      toast.success(`Saved "${product.name}" to your wishlist.`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    toast.info('Item removed from wishlist.');
  };

  const moveToCart = (product: Product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveToCart,
        totalCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
