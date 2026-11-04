import { Router, Request, Response } from 'express';
import { db } from '../db';

export const inventoryRouter = Router();

// GET /api/inventory/logs
inventoryRouter.get('/logs', (_req: Request, res: Response) => {
  const logs = db.get('inventoryLogs');
  res.json({ success: true, count: logs.length, data: logs });
});
