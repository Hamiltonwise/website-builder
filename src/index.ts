import dotenv from 'dotenv';
dotenv.config();

import 'express-async-errors';
import express from 'express';
import { siteRoute } from './routes/site';
import { extractSubdomain } from './middleware/subdomain';
import { getDb } from './lib/db';

const app = express();
const PORT = process.env.PORT || 7777;

// Ignore favicon requests
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Extract subdomain, then render site
app.use(extractSubdomain);
app.get('*', siteRoute);

const server = app.listen(PORT, () => {
  console.log(`Site renderer listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    getDb().destroy();
    process.exit(0);
  });
});
