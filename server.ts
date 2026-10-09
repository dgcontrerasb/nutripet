import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import initializeTrialHandler from './api/initialize-trial.ts';
import activateHandler from './api/subscription/activate.ts';

dotenv.config();

const dirName = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Mount API endpoints
  app.all('/api/initialize-trial', (req: Request, res: Response) => {
    return (initializeTrialHandler as any)(req, res);
  });

  app.all('/api/subscription/activate', (req: Request, res: Response) => {
    return (activateHandler as any)(req, res);
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(dirName, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
