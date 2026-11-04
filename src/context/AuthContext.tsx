import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Address } from '../types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  role: 'customer' | 'admin';
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: 'customer' | 'admin') => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const toast = useToast();

  const role = user?.role || 'customer';
  const isAuthenticated = !!user;

  const loginWithGoogle = async () => {
    try {
      const loggedUser = await authService.loginWithGoogle();
      setUser(loggedUser);
      toast.success(`Signed in as ${loggedUser.name}!`);
      return true;
    } catch {
      toast.error('Google sign in encountered an issue.');
      return false;
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const loggedUser = await authService.login(email, pass);
      setUser(loggedUser);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      return true;
    } catch {
      toast.error('Login failed. Please check credentials.');
      return false;
    }
  };

  const register = async (name: string, email: string, phone: string, pass: string) => {
    try {
      const newUser = await authService.register(name, email, phone, pass);
      setUser(newUser);
      toast.success(`Account created successfully. Welcome, ${name}!`);
      return true;
    } catch {
      toast.error('Registration failed.');
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    toast.info('Signed out successfully.');
  };

  const switchRole = async (targetRole: 'customer' | 'admin') => {
    const updated = await authService.switchRole(targetRole);
    setUser(updated);
    toast.info(`Switched interface mode to: ${targetRole.toUpperCase()}`);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return false;
    const updated = await authService.updateProfile(user.id, updates);
    if (updated) {
      setUser(updated);
      toast.success('Profile details updated.');
      return true;
    }
    return false;
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return false;
    await authService.addAddress(user.id, address);
    setUser(authService.getCurrentUser());
    toast.success('Address added to your address book.');
    return true;
  };

  const deleteAddress = async (id: string) => {
    if (!user) return false;
    await authService.deleteAddress(user.id, id);
    setUser(authService.getCurrentUser());
    toast.info('Address removed.');
    return true;
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return false;
    await authService.setDefaultAddress(user.id, id);
    setUser(authService.getCurrentUser());
    toast.success('Default delivery address updated.');
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        loginWithGoogle,
        register,
        logout,
        switchRole,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
