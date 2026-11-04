import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { productsRouter } from './server/routes/products';
import { categoriesRouter } from './server/routes/categories';
import { ordersRouter } from './server/routes/orders';
import { couponsRouter } from './server/routes/coupons';
import { reviewsRouter } from './server/routes/reviews';
import { customersRouter } from './server/routes/customers';
import { inventoryRouter } from './server/routes/inventory';
import { authRouter } from './server/routes/auth';
import { analyticsRouter } from './server/routes/analytics';
import { settingsRouter } from './server/routes/settings';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Mount REST API endpoints
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/coupons', couponsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/customers', customersRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/settings', settingsRouter);

  // Health probe
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'AURA Commerce Backend API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount Vite middleware in development or serve static build in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AURA Server] Live on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[AURA Server Initialization Error]', err);
  process.exit(1);
});
