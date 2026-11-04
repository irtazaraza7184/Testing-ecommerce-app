export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  images: string[];
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  specifications: Record<string, string>;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  inStock: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  isActive: boolean;
  iconName?: string;
}

export interface CartItem {
  id: string; // unique item id in cart (can be `${productId}-${color}-${size}`)
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  maxStock: number;
}

export interface WishlistItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  rating: number;
  category: string;
}

export interface Address {
  id: string;
  isDefault?: boolean;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

export type OrderStatus =
  | 'placed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
  shippingAddress: Address;
  shippingMethod: 'standard' | 'express';
  paymentMethod: 'card' | 'cod' | 'bank' | 'wallet';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note: string }[];
  trackingNumber?: string;
  estimatedDelivery: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  date: string;
  status: 'approved' | 'hidden';
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage?: number;
  fixedAmount?: number;
  minPurchase: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  registeredDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'suspended';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar?: string;
  addresses: Address[];
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  changeAmount: number;
  newStock: number;
  reason: string;
  date: string;
}
