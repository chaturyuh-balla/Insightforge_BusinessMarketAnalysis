import express from 'express';
import { authRequired } from '../middleware/authRequired.js';
import { isDatabaseConfigured, requireDb } from '../db.js';
import { createId, memory } from '../memoryStore.js';
import { generateInsightReport } from '../services/reportService.js';

const router = express.Router();

router.use(authRequired);

router.get('/', async (req, res, next) => {
  try {
    if (!isDatabaseConfigured) {
      const reports = memory.reports
        .filter((report) => report.user_id === req.session.user.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);
      return res.json({ reports });
    }

    const db = requireDb();
    const { rows } = await db.query(
      `select r.id, s.query, r.created_at, r.report_json
       from reports r
       join sessions s on s.id = r.session_id
       where s.user_id = $1
       order by r.created_at desc
       limit 20`,
      [req.session.user.id]
    );
    res.json({ reports: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query?.trim()) {
      return res.status(400).json({ message: 'Enter a company name or startup idea.' });
    }

    const report = await generateInsightReport(query.trim());
    if (!isDatabaseConfigured) {
      const session = {
        id: createId(),
        user_id: req.session.user.id,
        query: query.trim(),
        created_at: new Date().toISOString()
      };
      const savedReport = {
        id: createId(),
        user_id: req.session.user.id,
        session_id: session.id,
        query: session.query,
        created_at: new Date().toISOString(),
        report_json: report
      };
      memory.sessions.push(session);
      memory.reports.push(savedReport);
      return res.status(201).json({ report: savedReport });
    }

    const db = requireDb();
    const sessionResult = await db.query(
      'insert into sessions (user_id, query) values ($1, $2) returning id, query, created_at',
      [req.session.user.id, query.trim()]
    );
    const reportResult = await db.query(
      'insert into reports (session_id, report_json) values ($1, $2) returning id, created_at',
      [sessionResult.rows[0].id, report]
    );

    res.status(201).json({
      report: {
        id: reportResult.rows[0].id,
        query: sessionResult.rows[0].query,
        created_at: reportResult.rows[0].created_at,
        report_json: report
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
