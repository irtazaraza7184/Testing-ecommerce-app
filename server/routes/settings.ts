import { Router, Request, Response } from 'express';
import { db } from '../db';

export const settingsRouter = Router();

// GET /api/settings
settingsRouter.get('/', (_req: Request, res: Response) => {
  const settings = db.get('settings');
  res.json({ success: true, data: settings });
});

// PUT /api/settings
settingsRouter.put('/', (req: Request, res: Response) => {
  const current = db.get('settings');
  const updated = { ...current, ...req.body };
  db.set('settings', updated);
  res.json({ success: true, data: updated });
});

// POST /api/settings/reset
settingsRouter.post('/reset', (_req: Request, res: Response) => {
  db.reset();
  res.json({ success: true, message: 'Database reset to initial master seed' });
});
