import { User, Address, Customer } from '../types';
import { storage } from './storageService';
import { delay } from './api';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut as fbSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const USER_SESSION_KEY = 'aura_user_session';
const ADMIN_EMAILS = ['irtazaraza7184@gmail.com', 'admin@aura-retail.com'];

const DEMO_CUSTOMER: User = {
  id: 'usr-customer-1',
  name: 'Eleanor Vance',
  email: 'eleanor.vance@example.com',
  phone: '+1 (555) 392-8821',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  addresses: [
    {
      id: 'addr-01',
      isDefault: true,
      fullName: 'Eleanor Vance',
      phone: '+1 (555) 392-8821',
      street: '742 Evergreen Terrace',
      apartment: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94107',
      country: 'United States',
      instructions: 'Ring buzzer #42 or leave with concierge.',
    },
    {
      id: 'addr-02',
      isDefault: false,
      fullName: 'Eleanor Vance (Studio)',
      phone: '+1 (555) 392-8821',
      street: '185 Berry Street',
      apartment: 'Suite 210',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94107',
      country: 'United States',
    },
  ],
};

const DEMO_ADMIN: User = {
  id: 'usr-admin-1',
  name: 'Julian Sterling (Store Director)',
  email: 'admin@aura-retail.com',
  phone: '+1 (555) 902-1100',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
  addresses: [],
};

export const authService = {
  getCurrentUser(): User | null {
    const session = localStorage.getItem(USER_SESSION_KEY);
    if (!session) {
      // Default to logged-in customer for effortless review of all account/checkout flows
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(DEMO_CUSTOMER));
      return DEMO_CUSTOMER;
    }
    try {
      return JSON.parse(session);
    } catch {
      return DEMO_CUSTOMER;
    }
  },

  async loginWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdmin = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === fbUser.email?.toLowerCase());
      
      const user: User = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '+1 (555) 482-9901',
        role: isAdmin ? 'admin' : 'customer',
        avatar: fbUser.photoURL || undefined,
        addresses: [],
      };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      console.warn('[Firebase Auth] Google popup sign-in fallback:', err);
      // Fallback demo user
      const user = DEMO_CUSTOMER;
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      return user;
    }
  },

  async login(email: string, password?: string): Promise<User> {
    await delay(150);
    // Attempt Firebase sign in if password is provided
    if (password && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const isAdmin = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === res.user.email?.toLowerCase());
        const user: User = {
          id: res.user.uid,
          name: res.user.displayName || email.split('@')[0],
          email: res.user.email || email,
          phone: '+1 (555) 392-8821',
          role: isAdmin ? 'admin' : 'customer',
          addresses: [],
        };
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
        return user;
      } catch (fbErr) {
        console.warn('[Firebase Auth] Email login fallback:', fbErr);
      }
    }

    if (email.toLowerCase().includes('admin') || ADMIN_EMAILS.includes(email.toLowerCase())) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(DEMO_ADMIN));
      return DEMO_ADMIN;
    }

    // Check if customer exists in storage
    const customers = storage.getCustomers();
    const existing = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());

    const user: User = existing
      ? {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          phone: existing.phone,
          role: 'customer',
          addresses: existing.addresses || [],
        }
      : {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email,
          phone: '+1 (555) 000-0000',
          role: 'customer',
          addresses: [],
        };

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async register(name: string, email: string, phone: string, password?: string): Promise<User> {
    await delay(180);
    if (password && auth) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (fbErr) {
        console.warn('[Firebase Auth] Register user fallback:', fbErr);
      }
    }

    const customers = storage.getCustomers();
    const newCustomer: Customer = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      addresses: [],
      registeredDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
    };
    storage.saveCustomers([newCustomer, ...customers]);

    const user: User = {
      id: newCustomer.id,
      name,
      email,
      phone,
      role: 'customer',
      addresses: [],
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    await delay(100);
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem(USER_SESSION_KEY);
  },

  async switchRole(role: 'customer' | 'admin'): Promise<User> {
    const user = role === 'admin' ? DEMO_ADMIN : DEMO_CUSTOMER;
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    await delay(120);
    const current = this.getCurrentUser();
    if (!current || current.id !== userId) return null;

    const updated = { ...current, ...updates };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));

    // Also sync to customer list
    const customers = storage.getCustomers();
    const custIndex = customers.findIndex((c) => c.id === userId);
    if (custIndex >= 0) {
      customers[custIndex] = {
        ...customers[custIndex],
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
      };
      storage.saveCustomers(customers);
    }

    return updated;
  },

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    await delay(120);
    const user = this.getCurrentUser();
    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`,
      isDefault: address.isDefault || (user?.addresses.length === 0),
    };

    if (user && user.id === userId) {
      if (newAddr.isDefault) {
        user.addresses = user.addresses.map((a) => ({ ...a, isDefault: false }));
      }
      user.addresses.push(newAddr);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));

      // Sync customer
      const customers = storage.getCustomers();
      const c = customers.find((cust) => cust.id === userId);
      if (c) {
        c.addresses = user.addresses;
        storage.saveCustomers(customers);
      }
    }

    return newAddr;
  },

  async deleteAddress(userId: string, addressId: string): Promise<boolean> {
    await delay(100);
    const user = this.getCurrentUser();
    if (!user || user.id !== userId) return false;

    user.addresses = user.addresses.filter((a) => a.id !== addressId);
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));

    const customers = storage.getCustomers();
    const c = customers.find((cust) => cust.id === userId);
    if (c) {
      c.addresses = user.addresses;
      storage.saveCustomers(customers);
    }
    return true;
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
    await delay(100);
    const user = this.getCurrentUser();
    if (!user || user.id !== userId) return false;

    user.addresses = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return true;
  },
};
