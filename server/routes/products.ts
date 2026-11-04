import { Router, Request, Response } from 'express';
import { db } from '../db';

export const productsRouter = Router();

// GET /api/products
productsRouter.get('/', (req: Request, res: Response) => {
  let items = [...db.get('products')];
  const { category, search, brand, minPrice, maxPrice, rating, sort, inStockOnly } = req.query;

  if (category && category !== 'all') {
    items = items.filter(
      (p) =>
        p.category.toLowerCase() === String(category).toLowerCase() ||
        p.categoryId === String(category)
    );
  }

  if (search && String(search).trim()) {
    const q = String(search).toLowerCase().trim();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  if (brand && brand !== 'all') {
    items = items.filter((p) => p.brand.toLowerCase() === String(brand).toLowerCase());
  }

  if (minPrice !== undefined) {
    items = items.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice !== undefined) {
    items = items.filter((p) => p.price <= Number(maxPrice));
  }

  if (rating !== undefined && Number(rating) > 0) {
    items = items.filter((p) => p.rating >= Number(rating));
  }

  if (inStockOnly === 'true') {
    items = items.filter((p) => p.inStock && p.stock > 0);
  }

  if (sort) {
    switch (sort) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'best-selling':
        items.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'featured':
      default:
        items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
  }

  res.json({ success: true, count: items.length, data: items });
});

// GET /api/products/:id
productsRouter.get('/:id', (req: Request, res: Response) => {
  const products = db.get('products');
  const prod = products.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!prod) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: prod });
});

// POST /api/products (Admin)
productsRouter.post('/', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.price) {
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  }

  const products = [...db.get('products')];
  const newProduct = {
    ...body,
    id: `prod-${Date.now()}`,
    slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    rating: body.rating || 5.0,
    reviewCount: body.reviewCount || 1,
    inStock: body.stock !== undefined ? body.stock > 0 : true,
    createdAt: new Date().toISOString().split('T')[0],
  };

  products.unshift(newProduct);
  db.set('products', products);

  // Update category itemCount
  const categories = [...db.get('categories')];
  const cat = categories.find((c) => c.name === newProduct.category || c.id === newProduct.categoryId);
  if (cat) {
    cat.itemCount += 1;
    db.set('categories', categories);
  }

  res.status(201).json({ success: true, data: newProduct });
});

// PUT /api/products/:id
productsRouter.put('/:id', (req: Request, res: Response) => {
  const products = [...db.get('products')];
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const current = products[idx];
  const updated = {
    ...current,
    ...req.body,
    inStock: req.body.stock !== undefined ? req.body.stock > 0 : current.inStock,
  };
  products[idx] = updated;
  db.set('products', products);

  res.json({ success: true, data: updated });
});

// DELETE /api/products/:id
productsRouter.delete('/:id', (req: Request, res: Response) => {
  const products = [...db.get('products')];
  const item = products.find((p) => p.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const filtered = products.filter((p) => p.id !== req.params.id);
  db.set('products', filtered);

  // Decrement category count
  const categories = [...db.get('categories')];
  const cat = categories.find((c) => c.name === item.category || c.id === item.categoryId);
  if (cat && cat.itemCount > 0) {
    cat.itemCount -= 1;
    db.set('categories', categories);
  }

  res.json({ success: true, message: 'Product deleted' });
});

// POST /api/products/:id/adjust-stock
productsRouter.post('/:id/adjust-stock', (req: Request, res: Response) => {
  const { delta, reason } = req.body;
  if (delta === undefined) {
    return res.status(400).json({ success: false, message: 'Delta is required' });
  }

  const products = [...db.get('products')];
  const prod = products.find((p) => p.id === req.params.id);
  if (!prod) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const newStock = Math.max(0, prod.stock + Number(delta));
  prod.stock = newStock;
  prod.inStock = newStock > 0;
  db.set('products', products);

  // Append inventory log
  const logs = [...db.get('inventoryLogs')];
  const newLog = {
    id: `inv-${Date.now()}`,
    productId: prod.id,
    productName: prod.name,
    changeAmount: Number(delta),
    newStock,
    reason: reason || 'Manual calibration',
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  logs.unshift(newLog);
  db.set('inventoryLogs', logs);

  res.json({ success: true, data: prod });
});
