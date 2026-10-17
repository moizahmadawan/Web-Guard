import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import routes from './routes.js';
import { Scan } from './models.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, max: 120 }), routes);
app.use((err, _req, res, _next) => res.status(500).json({ error: err.message }));

try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webguard');
  console.log('MongoDB connected');
} catch (e) {
  console.error('MongoDB connection failed:', e.message);
  process.exit(1);
}

await Scan.updateMany({ status: { $in: ['queued', 'running'] } }, { status: 'failed', error: 'Server restarted' });
app.listen(process.env.PORT || 4000, () => console.log('WebGuard API ready'));