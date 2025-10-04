// ==========================
// File: src/presentation/routes/jobRoutes.ts
// ==========================
import { Router } from 'express';
import { JobController } from '../controllers/JobController';

export const buildJobRoutes = (ctl: JobController) => {
  const r = Router();

  // Core job endpoints
  r.post('/jobs', ctl.queue);
  r.post('/jobs/:id/run', ctl.run);
  r.post('/jobs/:id/cancel', ctl.cancel);
  r.get('/jobs', ctl.list);
  r.get('/jobs/:id', ctl.detail);
  r.get('/jobs/:id/logs', ctl.logs);

  // Scheduler endpoints
  r.post('/jobs/schedule', (req, res) => {
    const { id, cron, job, active } = req.body;
    if (!id || !cron || !job) {
      return res.status(400).json({ error: 'id, cron, job required' });
    }
    (ctl as any).scheduler.add(id, cron, job, active ?? true);
    return res.status(201).json({ ok: true }); // <-- added return
  });

  r.get('/jobs/schedule', (_req, res) => {
    res.json((ctl as any).scheduler.list());
  });

  r.post('/jobs/schedule/:id/toggle', (req, res) => {
    const { enabled } = req.body as { enabled: boolean };
    (ctl as any).scheduler.toggle(req.params.id, !!enabled);
    res.json({ ok: true });
  });

  r.delete('/jobs/schedule/:id', (req, res) => {
    (ctl as any).scheduler.remove(req.params.id);
    res.json({ ok: true });
  });

  return r;
};

// ❌ remove any `export default r` from the old file
