import { Router, Request, Response } from 'express';
import { db } from '../db';

export const categoriesRouter = Router();

// GET /api/categories
categoriesRouter.get('/', (_req: Request, res: Response) => {
  const categories = db.get('categories');
  res.json({ success: true, count: categories.length, data: categories });
});

// POST /api/categories
categoriesRouter.post('/', (req: Request, res: Response) => {
  const { name, slug, description, image, isActive } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  const categories = [...db.get('categories')];
  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    image: image || '/src/assets/images/hero_modern_lifestyle_1793816057132.jpg',
    itemCount: 0,
    isActive: isActive !== undefined ? isActive : true,
  };

  categories.push(newCat);
  db.set('categories', categories);

  res.status(201).json({ success: true, data: newCat });
});

// PUT /api/categories/:id
categoriesRouter.put('/:id', (req: Request, res: Response) => {
  const categories = [...db.get('categories')];
  const idx = categories.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  categories[idx] = { ...categories[idx], ...req.body };
  db.set('categories', categories);

  res.json({ success: true, data: categories[idx] });
});

// DELETE /api/categories/:id
categoriesRouter.delete('/:id', (req: Request, res: Response) => {
  const categories = [...db.get('categories')];
  const filtered = categories.filter((c) => c.id !== req.params.id);
  db.set('categories', filtered);
  res.json({ success: true, message: 'Category deleted' });
});
