import { Router, Request, Response } from 'express';
import { db } from '../db';

export const couponsRouter = Router();

// GET /api/coupons
couponsRouter.get('/', (_req: Request, res: Response) => {
  const coupons = db.get('coupons');
  res.json({ success: true, count: coupons.length, data: coupons });
});

// POST /api/coupons/validate
couponsRouter.post('/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Code is required', discountAmount: 0 });
  }

  const coupons = db.get('coupons');
  const coupon = coupons.find(
    (c) => c.code.toLowerCase() === String(code).trim().toLowerCase() && c.isActive
  );

  if (!coupon) {
    return res.json({ valid: false, message: 'Invalid or inactive promotional voucher.', discountAmount: 0 });
  }

  if (new Date(coupon.expiryDate) < new Date()) {
    return res.json({ valid: false, message: 'This promotion has expired.', discountAmount: 0 });
  }

  const amount = Number(subtotal) || 0;
  if (amount < coupon.minPurchase) {
    return res.json({
      valid: false,
      message: `Minimum order value of $${coupon.minPurchase} required for voucher ${coupon.code}.`,
      discountAmount: 0,
    });
  }

  let discountAmount = 0;
  if (coupon.discountPercentage) {
    discountAmount = Math.round(((amount * coupon.discountPercentage) / 100) * 100) / 100;
  } else if (coupon.fixedAmount) {
    discountAmount = Math.min(amount, coupon.fixedAmount);
  }

  res.json({
    valid: true,
    coupon,
    message: `Voucher applied: ${coupon.discountPercentage ? `${coupon.discountPercentage}% off` : `$${coupon.fixedAmount} off`}`,
    discountAmount,
  });
});

// POST /api/coupons
couponsRouter.post('/', (req: Request, res: Response) => {
  const { code, discountPercentage, fixedAmount, minPurchase, expiryDate, usageLimit, isActive } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  const coupons = [...db.get('coupons')];
  const newCoupon = {
    id: `coup-${Date.now()}`,
    code: String(code).toUpperCase().trim(),
    discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
    fixedAmount: fixedAmount ? Number(fixedAmount) : undefined,
    minPurchase: Number(minPurchase) || 0,
    expiryDate: expiryDate || '2027-12-31',
    usageLimit: Number(usageLimit) || 100,
    timesUsed: 0,
    isActive: isActive !== undefined ? isActive : true,
  };

  coupons.unshift(newCoupon);
  db.set('coupons', coupons);

  res.status(201).json({ success: true, data: newCoupon });
});

// PUT /api/coupons/:id
couponsRouter.put('/:id', (req: Request, res: Response) => {
  const coupons = [...db.get('coupons')];
  const idx = coupons.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  coupons[idx] = { ...coupons[idx], ...req.body };
  db.set('coupons', coupons);

  res.json({ success: true, data: coupons[idx] });
});

// DELETE /api/coupons/:id
couponsRouter.delete('/:id', (req: Request, res: Response) => {
  const coupons = [...db.get('coupons')];
  const filtered = coupons.filter((c) => c.id !== req.params.id);
  db.set('coupons', filtered);
  res.json({ success: true, message: 'Coupon deleted' });
});
