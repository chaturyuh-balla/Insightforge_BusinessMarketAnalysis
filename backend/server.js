import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import { pool } from './db.js';

const app = express();
const PgSession = connectPgSimple(session);
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '2mb' }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(
  session({
    store: pool ? new PgSession({ pool, createTableIfMissing: true }) : undefined,
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'InsightForge AI' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`InsightForge API running on http://localhost:${PORT}`);
});
