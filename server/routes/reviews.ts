import { Router, Request, Response } from 'express';
import { db } from '../db';

export const reviewsRouter = Router();

// GET /api/reviews
reviewsRouter.get('/', (req: Request, res: Response) => {
  let reviews = [...db.get('reviews')];
  const { productId } = req.query;

  if (productId) {
    reviews = reviews.filter((r) => r.productId === productId);
  }

  res.json({ success: true, count: reviews.length, data: reviews });
});

// POST /api/reviews
reviewsRouter.post('/', (req: Request, res: Response) => {
  const { productId, productName, customerName, customerEmail, rating, title, comment } = req.body;
  if (!productId || !customerName || !comment) {
    return res.status(400).json({ success: false, message: 'Product ID, customer name, and comment are required' });
  }

  const reviews = [...db.get('reviews')];
  const newReview = {
    id: `rev-${Date.now()}`,
    productId,
    productName: productName || 'Masterpiece Object',
    customerName,
    customerEmail: customerEmail || 'verified.collector@example.com',
    rating: Number(rating) || 5,
    title: title || 'Exceptional Quality',
    comment,
    verifiedPurchase: true,
    date: new Date().toISOString().split('T')[0],
    status: 'approved',
  };

  reviews.unshift(newReview);
  db.set('reviews', reviews);

  // Recalculate product rating
  const products = [...db.get('products')];
  const prod = products.find((p) => p.id === productId);
  if (prod) {
    const prodReviews = reviews.filter((r) => r.productId === prod.id && r.status === 'approved');
    const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
    prod.rating = Math.round((sum / prodReviews.length) * 10) / 10;
    prod.reviewCount = prodReviews.length;
    db.set('products', products);
  }

  res.status(201).json({ success: true, data: newReview });
});

// PUT /api/reviews/:id/status
reviewsRouter.put('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const reviews = [...db.get('reviews')];
  const idx = reviews.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  reviews[idx].status = status;
  db.set('reviews', reviews);

  res.json({ success: true, data: reviews[idx] });
});

// DELETE /api/reviews/:id
reviewsRouter.delete('/:id', (req: Request, res: Response) => {
  const reviews = [...db.get('reviews')];
  const filtered = reviews.filter((r) => r.id !== req.params.id);
  db.set('reviews', filtered);
  res.json({ success: true, message: 'Review deleted' });
});
