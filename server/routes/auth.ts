import { Router, Request, Response } from 'express';
import { db } from '../db';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  if (email.toLowerCase().includes('admin')) {
    const adminUser = {
      id: 'usr-admin-1',
      name: 'Julian Sterling (Store Director)',
      email: 'admin@aura-retail.com',
      phone: '+1 (555) 902-1100',
      role: 'admin',
      addresses: [],
    };
    return res.json({ success: true, user: adminUser, token: 'demo-admin-token-jwt' });
  }

  const customers = db.get('customers');
  const existing = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());

  const user = existing
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

  res.json({ success: true, user, token: 'demo-customer-token-jwt' });
});

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const customers = [...db.get('customers')];
  const newCustomer = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone: phone || '+1 (555) 000-0000',
    addresses: [],
    registeredDate: new Date().toISOString().split('T')[0],
    totalOrders: 0,
    totalSpent: 0,
    status: 'active',
  };

  customers.unshift(newCustomer);
  db.set('customers', customers);

  const user = {
    id: newCustomer.id,
    name,
    email,
    phone: newCustomer.phone,
    role: 'customer',
    addresses: [],
  };

  res.status(201).json({ success: true, user, token: 'demo-new-customer-jwt' });
});
