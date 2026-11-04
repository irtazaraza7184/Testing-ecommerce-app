import { Router, Request, Response } from 'express';
import { db } from '../db';

export const customersRouter = Router();

// GET /api/customers
customersRouter.get('/', (_req: Request, res: Response) => {
  const customers = db.get('customers');
  res.json({ success: true, count: customers.length, data: customers });
});

// GET /api/customers/:id
customersRouter.get('/:id', (req: Request, res: Response) => {
  const customers = db.get('customers');
  const cust = customers.find((c) => c.id === req.params.id);
  if (!cust) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  res.json({ success: true, data: cust });
});

// PUT /api/customers/:id/status
customersRouter.put('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const customers = [...db.get('customers')];
  const idx = customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  customers[idx].status = status;
  db.set('customers', customers);

  res.json({ success: true, data: customers[idx] });
});
