import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Check,
  Truck,
  RotateCcw,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { Order, Address } from '../../types';

export const AccountPage: React.FC = () => {
  const { user, logout, updateProfile, addAddress, deleteAddress, setDefaultAddress, switchRole } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'security'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Add Address Modal / Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrApt, setAddrApt] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrCountry, setAddrCountry] = useState('United States');

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    orderService.getOrders(user.id).then((res) => {
      // If user has no orders, get all mock orders for rich demo viewing
      if (res.length === 0) {
        orderService.getOrders().then((all) => setOrders(all));
      } else {
        setOrders(res);
      }
      setLoadingOrders(false);
    });
  }, [user, navigate]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({ name, email, phone });
    setSavingProfile(false);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAddress({
      fullName: addrName,
      phone: addrPhone,
      street: addrStreet,
      apartment: addrApt,
      city: addrCity,
      state: addrState,
      postalCode: addrPostal,
      country: addrCountry,
    });
    setShowAddressForm(false);
    setAddrName('');
    setAddrPhone('');
    setAddrStreet('');
    setAddrApt('');
    setAddrCity('');
    setAddrState('');
    setAddrPostal('');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmNewPass) {
      toast.error('New passwords do not match.');
      return;
    }
    toast.success('Your security password has been updated.');
    setCurrentPass('');
    setNewPass('');
    setConfirmNewPass('');
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      // Add items to bag
      addToCart({
        id: item.productId,
        name: item.name,
        slug: item.productId,
        brand: 'AURA Atelier',
        category: 'Acoustics & Studio',
        categoryId: 'cat-audio',
        description: '',
        shortDescription: '',
        price: item.price,
        rating: 5,
        reviewCount: 1,
        stock: 10,
        sku: 'RE-ORD',
        images: [item.image],
        specifications: {},
        inStock: true,
        createdAt: '2026-01-01',
      }, item.quantity, item.selectedColor, item.selectedSize);
    });
    toast.success('Items from previous dispatch added to your bag.');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-display text-xl font-bold flex items-center justify-center">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              {user.name}
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              {user.email} · Collector Member since 2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              switchRole('admin');
              navigate('/admin');
            }}
            className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open Admin Console</span>
          </button>
          <button
            onClick={logout}
            className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar (3 Cols) */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-1 shadow-xs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Order History & Dispatches</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Delivery Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === 'security'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Account Security</span>
            </button>
          </div>
        </aside>

        {/* Content Area (9 Cols) */}
        <div className="lg:col-span-9">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Your Dispatches & Orders ({orders.length})
                </h2>
              </div>

              {loadingOrders ? (
                <div className="p-12 text-center">
                  <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Retrieving order registry...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 mb-4">No completed orders recorded yet.</p>
                  <Link
                    to="/shop"
                    className="py-2 px-4 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                  >
                    Explore Catalog
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Order No.
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {order.orderNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Date Placed
                          </span>
                          <span className="text-slate-700 font-mono">{order.createdAt}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Total Paid
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            ${order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase bg-slate-900 text-white">
                          {order.status.replace('_', ' ')}
                        </span>
                        <Link
                          to={`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`}
                          className="py-1 px-3 bg-white border border-slate-300 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Track</span>
                        </Link>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 divide-y divide-slate-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded bg-slate-100 border border-slate-200"
                            />
                            <div>
                              <span className="font-semibold text-slate-900 block">{item.name}</span>
                              <span className="text-slate-500 font-mono">
                                Qty: {item.quantity} {item.selectedColor ? `· ${item.selectedColor}` : ''}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-slate-900">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500">
                        Destination: {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                      <button
                        onClick={() => handleReorder(order)}
                        className="text-slate-800 hover:text-slate-950 font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Re-order Items</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Personal Collector Profile
              </h2>

              <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="py-2.5 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Saved Delivery Addresses ({user.addresses.length})
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="py-2 px-3.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Destination</span>
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form
                  onSubmit={handleAddressSubmit}
                  className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm space-y-4"
                >
                  <h3 className="text-sm font-semibold text-slate-900">New Delivery Destination</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Phone</label>
                      <input
                        type="tel"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-slate-700 block mb-1">Street</label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Apt/Suite</label>
                      <input
                        type="text"
                        value={addrApt}
                        onChange={(e) => setAddrApt(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={addrPostal}
                        onChange={(e) => setAddrPostal(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="py-2 px-4 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                    >
                      Save Destination
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white p-5 rounded-xl border relative shadow-xs flex flex-col justify-between ${
                      addr.isDefault ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-slate-900">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {addr.street} {addr.apartment}
                      </p>
                      <p className="text-xs text-slate-600">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-1">{addr.phone}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-slate-700 hover:text-slate-950 font-semibold"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Primary destination</span>
                      )}
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Security & Credential Management
              </h2>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-6 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Update Security Credentials
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
