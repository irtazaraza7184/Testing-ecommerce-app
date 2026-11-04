import { Router, Request, Response } from 'express';
import { db } from '../db';

export const ordersRouter = Router();

// GET /api/orders
ordersRouter.get('/', (req: Request, res: Response) => {
  let orders = [...db.get('orders')];
  const { userId, status } = req.query;

  if (userId) {
    orders = orders.filter((o) => o.userId === userId);
  }
  if (status && status !== 'all') {
    orders = orders.filter((o) => o.status === status);
  }

  res.json({ success: true, count: orders.length, data: orders });
});

// GET /api/orders/:id
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const orders = db.get('orders');
  const term = req.params.id.toLowerCase().trim();
  const order = orders.find(
    (o) => o.id.toLowerCase() === term || o.orderNumber.toLowerCase() === term
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, data: order });
});

// POST /api/orders
ordersRouter.post('/', (req: Request, res: Response) => {
  const {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    items,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    totalAmount,
    couponCode,
    shippingAddress,
    shippingMethod,
    paymentMethod,
  } = req.body;

  if (!items || !items.length || !customerName || !shippingAddress) {
    return res.status(400).json({ success: false, message: 'Invalid order consignment payload' });
  }

  const orders = [...db.get('orders')];
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const uniqueNum = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `AUR-${new Date().getFullYear()}-${uniqueNum}`;

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    userId: userId || 'usr-customer-1',
    customerName,
    customerEmail,
    customerPhone,
    items,
    subtotal,
    discountAmount: discountAmount || 0,
    shippingFee: shippingFee || 0,
    taxAmount: taxAmount || 0,
    totalAmount,
    couponCode: couponCode || null,
    shippingAddress,
    shippingMethod: shippingMethod || 'standard',
    paymentMethod: paymentMethod || 'card',
    paymentStatus: 'paid',
    status: 'placed',
    statusHistory: [
      {
        status: 'placed',
        timestamp: dateStr,
        note: `Order verified and placed via ${String(paymentMethod).toUpperCase()}.`,
      },
    ],
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    createdAt: new Date().toISOString().split('T')[0],
  };

  orders.unshift(newOrder);
  db.set('orders', orders);

  // Deduct inventory and record logs
  const products = [...db.get('products')];
  const logs = [...db.get('inventoryLogs')];

  items.forEach((item: any) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.inStock = prod.stock > 0;
      logs.unshift({
        id: `inv-${Date.now()}-${item.productId}`,
        productId: prod.id,
        productName: prod.name,
        changeAmount: -item.quantity,
        newStock: prod.stock,
        reason: `Fulfillment Order #${orderNumber}`,
        date: dateStr,
      });
    }
  });

  db.set('products', products);
  db.set('inventoryLogs', logs);

  // Update coupon usage count if used
  if (couponCode) {
    const coupons = [...db.get('coupons')];
    const coup = coupons.find((c) => c.code.toLowerCase() === couponCode.toLowerCase());
    if (coup) {
      coup.timesUsed += 1;
      db.set('coupons', coupons);
    }
  }

  // Update customer spending
  const customers = [...db.get('customers')];
  const cust = customers.find((c) => c.id === userId || c.email === customerEmail);
  if (cust) {
    cust.totalOrders += 1;
    cust.totalSpent += totalAmount;
    db.set('customers', customers);
  }

  res.status(201).json({ success: true, data: newOrder });
});

// PUT /api/orders/:id/status
ordersRouter.put('/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const orders = [...db.get('orders')];
  const idx = orders.findIndex(
    (o) => o.id === req.params.id || o.orderNumber === req.params.id
  );
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const order = orders[idx];
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: dateStr,
    note: note || `Order status updated to ${status.replace('_', ' ')}.`,
  });

  if (status === 'shipped' && !order.trackingNumber) {
    order.trackingNumber = `FX-${Math.floor(10000000 + Math.random() * 90000000)}`;
  }

  orders[idx] = order;
  db.set('orders', orders);

  res.json({ success: true, data: order });
});
