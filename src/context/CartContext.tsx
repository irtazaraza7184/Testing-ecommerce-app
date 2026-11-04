import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { orderService } from '../services/orderService';
import { useToast } from './ToastContext';

const CART_STORAGE_KEY = 'aura_shopping_cart';
const COUPON_STORAGE_KEY = 'aura_applied_coupon';
const FREE_SHIPPING_THRESHOLD = 150;

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  totalCount: number;
  freeShippingThreshold: number;
  amountUntilFreeShipping: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    const color = selectedColor || (product.colors && product.colors[0]?.name);
    const size = selectedSize || (product.sizes && product.sizes[0]);
    const cartItemId = `${product.id}-${color || 'default'}-${size || 'default'}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0],
          quantity: Math.min(product.stock, quantity),
          selectedColor: color,
          selectedSize: size,
          maxStock: product.stock,
        };
        return [...prevItems, newItem];
      }
    });

    toast.success(`Added "${product.name}" to shopping bag.`);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    toast.info('Item removed from shopping bag.');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const clamped = Math.min(item.maxStock, quantity);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minPurchase) {
    if (appliedCoupon.discountPercentage) {
      couponDiscount = Math.round(((subtotal * appliedCoupon.discountPercentage) / 100) * 100) / 100;
    } else if (appliedCoupon.fixedAmount) {
      couponDiscount = Math.min(subtotal, appliedCoupon.fixedAmount);
    }
  }

  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const taxAmount = Math.round(taxableAmount * 0.075 * 100) / 100; // 7.5% estimated
  const totalAmount = Math.max(0, taxableAmount + shippingFee + taxAmount);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const applyCoupon = async (code: string): Promise<boolean> => {
    const res = await orderService.validateCoupon(code, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      toast.success(res.message);
      return true;
    } else {
      toast.error(res.message || 'Invalid promotion code.');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Promotion code removed.');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        subtotal,
        shippingFee,
        taxAmount,
        totalAmount,
        totalCount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountUntilFreeShipping,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
