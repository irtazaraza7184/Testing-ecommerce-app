import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Check,
  Lock,
  CreditCard,
  Truck,
  Building,
  Smartphone,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { Address, Order } from '../../types';

export const CheckoutPage: React.FC = () => {
  const {
    items,
    subtotal,
    couponDiscount,
    appliedCoupon,
    taxAmount,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Multi-step: 1 = Contact & Address, 2 = Shipping Method, 3 = Payment Method, 4 = Review & Submit
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const defaultAddress = user?.addresses.find((a) => a.isDefault) || user?.addresses[0];

  const [customerName, setCustomerName] = useState(user?.name || 'Eleanor Vance');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'eleanor.vance@example.com');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+1 (555) 392-8821');

  const [street, setStreet] = useState(defaultAddress?.street || '742 Evergreen Terrace');
  const [apartment, setApartment] = useState(defaultAddress?.apartment || 'Apt 4B');
  const [city, setCity] = useState(defaultAddress?.city || 'San Francisco');
  const [state, setState] = useState(defaultAddress?.state || 'CA');
  const [postalCode, setPostalCode] = useState(defaultAddress?.postalCode || '94107');
  const [country, setCountry] = useState(defaultAddress?.country || 'United States');
  const [instructions, setInstructions] = useState(
    defaultAddress?.instructions || 'Ring buzzer #42 or leave with concierge.'
  );

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'bank' | 'wallet'>('card');

  // Simulated Card Info
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Calculations
  const shippingCharge = shippingMethod === 'express' ? 18 : subtotal >= 150 ? 0 : 15;
  const finalTotal = Math.max(0, subtotal - couponDiscount + shippingCharge + taxAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Items in Reservation</h2>
        <p className="text-xs text-slate-500 mb-6">Your shopping bag is empty.</p>
        <Link
          to="/shop"
          className="py-2.5 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderAddress: Address = {
        id: `addr-${Date.now()}`,
        fullName: customerName,
        phone: customerPhone,
        street,
        apartment,
        city,
        state,
        postalCode,
        country,
        instructions,
      };

      const newOrder = await orderService.createOrder({
        userId: user?.id || 'guest-usr',
        customerName,
        customerEmail,
        customerPhone,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
          selectedColor: i.selectedColor,
          selectedSize: i.selectedSize,
        })),
        subtotal,
        discountAmount: couponDiscount,
        shippingFee: shippingCharge,
        taxAmount,
        totalAmount: finalTotal,
        couponCode: appliedCoupon?.code,
        shippingAddress: orderAddress,
        shippingMethod,
        paymentMethod,
        paymentStatus: 'paid',
      });

      clearCart();
      toast.success(`Order #${newOrder.orderNumber} confirmed!`);
      navigate(`/order-success/${newOrder.id}`);
    } catch {
      toast.error('An error occurred while confirming your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Secure Checkout</h1>
            <span className="text-xs text-slate-500 font-mono">Encrypted 256-bit checkout session</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <Lock className="w-3.5 h-3.5" />
          <span className="font-semibold">Safe & Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Multi-Step Forms (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 ${
                currentStep >= 1 ? 'text-slate-900 font-semibold' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 1
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span>Address</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

            <button
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2 ${
                currentStep >= 2 ? 'text-slate-900 font-semibold' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 2
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span>Shipping</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

            <button
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2 ${
                currentStep >= 3 ? 'text-slate-900 font-semibold' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep > 3
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 3
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 3 ? <Check className="w-3 h-3" /> : '3'}
              </span>
              <span>Payment</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

            <button
              onClick={() => setCurrentStep(4)}
              className={`flex items-center gap-2 ${
                currentStep === 4 ? 'text-slate-900 font-semibold' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep === 4 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                4
              </span>
              <span>Review</span>
            </button>
          </div>

          {/* STEP 1: Customer Contact & Delivery Address */}
          {currentStep === 1 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                1. Contact & Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email for Confirmation & Tracking
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Apt / Suite / Unit
                  </label>
                  <input
                    type="text"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Delivery Notes</label>
                <input
                  type="text"
                  placeholder="Gate code, concierge instructions, white-glove placement..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="py-2.5 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <span>Continue to Shipping Method</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Method */}
          {currentStep === 2 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                2. Shipping & Handling Speed
              </h2>

              <div className="space-y-3">
                <label
                  onClick={() => setShippingMethod('standard')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-slate-900 bg-slate-50/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-slate-800" />
                    <div>
                      <strong className="text-xs text-slate-900 block">
                        Standard Insured Ground
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        3 to 5 business days · Carbon-neutral transit
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {subtotal >= 150 ? 'FREE' : '$15'}
                  </span>
                </label>

                <label
                  onClick={() => setShippingMethod('express')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-slate-900 bg-slate-50/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-slate-800" />
                    <div>
                      <strong className="text-xs text-slate-900 block">
                        FedEx Priority Air / White Glove
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Next business day dispatch · Signature required
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-900">$18</span>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="py-2.5 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Options (Simulation) */}
          {currentStep === 3 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                3. Payment Details (Demo Environment)
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-medium">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span className="text-xs font-medium">Cash on Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="text-xs font-medium">Bank Wire</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-medium">Digital Pay</span>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Expiry MM/YY
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        CVC Code
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    * Demo mode active. No actual financial debit will occur.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900 mb-1">Cash on Delivery Policy</p>
                  <p>
                    Please have exact payment of <strong className="font-mono text-slate-900">${finalTotal}</strong> ready
                    at time of courier delivery. Courier will verify government-issued ID upon handover.
                  </p>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-900 mb-1">Wire Transfer Instructions</p>
                  <p>Bank: First National Commercial Bank</p>
                  <p>Account: AURA Retail Holdings LLC · IBAN: US88FNCB002981920</p>
                  <p>Reference: Include your order number after placing.</p>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 text-center">
                  <p className="font-semibold text-slate-900 mb-1">One-Touch Express Digital Wallet</p>
                  <p>Apple Pay / Google Wallet demo integration will be authorized instantly.</p>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="py-2.5 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <span>Review Final Order</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review and Place Order */}
          {currentStep === 4 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                4. Review & Confirm Order
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">Shipping To:</span>
                  <p className="text-slate-600">{customerName}</p>
                  <p className="text-slate-600">
                    {street} {apartment}
                  </p>
                  <p className="text-slate-600">
                    {city}, {state} {postalCode}
                  </p>
                  <p className="text-slate-600 font-mono mt-1">{customerPhone}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-1">Payment & Dispatch:</span>
                  <p className="text-slate-600 capitalize">Method: {paymentMethod.toUpperCase()}</p>
                  <p className="text-slate-600 capitalize">Delivery: {shippingMethod} ($ {shippingCharge})</p>
                  <p className="text-slate-600 font-mono mt-1">Receipt to: {customerEmail}</p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-900 block">Items in this dispatch:</span>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-10 object-cover rounded bg-slate-100" />
                      <div>
                        <span className="font-semibold text-slate-900 block">{item.name}</span>
                        <span className="text-slate-500 font-mono">
                          Qty: {item.quantity} · {item.selectedColor || 'Default'}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-slate-900">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="py-3 px-8 bg-slate-900 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-md flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>{isSubmitting ? 'Authorizing Order...' : `Place Order · $${finalTotal.toLocaleString()}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Order Summary (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs sticky top-24 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Reservation Summary
            </h3>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
              {items.map((i) => (
                <div key={i.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={i.image} alt="" className="w-10 h-10 object-cover rounded bg-slate-100" />
                    <div>
                      <span className="font-medium text-slate-900 block line-clamp-1">{i.name}</span>
                      <span className="text-slate-400 font-mono">Qty: {i.quantity}</span>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    ${(i.price * i.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-slate-900">
                  ${subtotal.toLocaleString()}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promotional Voucher</span>
                  <span className="font-mono">-${couponDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping ({shippingMethod})</span>
                <span className="font-mono text-slate-900">
                  {shippingCharge === 0 ? 'FREE' : `$${shippingCharge}`}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Sales Tax (7.5%)</span>
                <span className="font-mono text-slate-900">
                  ${taxAmount.toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Grand Total</span>
                <span className="font-mono font-bold text-xl text-slate-950 tabular-nums">
                  ${finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <p>• 30-Day in-home acoustic & ergonomic trial.</p>
              <p>• White glove delivery & assembly assistance.</p>
              <p>• 3-Year structural & movement warranty included.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
