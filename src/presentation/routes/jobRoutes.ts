// ==========================
// File: src/presentation/routes/jobRoutes.ts 
// ==========================
import { Router } from 'express';
import { JobController } from '../controllers/JobController';

export const buildJobRoutes = (ctl: JobController) => {
  const r = Router();

  // Core job endpoints
  r.post('/', ctl.queue.bind(ctl))
  r.post('/:id/run', ctl.run.bind(ctl))
  r.post('/:id/cancel', ctl.cancel.bind(ctl))
  r.get('/', ctl.list.bind(ctl))
  r.get('/:id', ctl.detail.bind(ctl))
  r.get('/:id/logs', ctl.logs.bind(ctl))

  // Scheduler endpoints
  r.post('/schedule', (req, res) => {
    const { id, cron, job, active } = req.body;
    if (!id || !cron || !job) {
      return res.status(400).json({ error: 'id, cron, job required' });
    }
    (ctl as any).scheduler.add(id, cron, job, active ?? true);
    return res.status(201).json({ ok: true }); // <-- added return
  });

  r.get('/schedule', (_req, res) => {
    res.json((ctl as any).scheduler.list());
  });

  r.post('/schedule/:id/toggle', (req, res) => {
    const { enabled } = req.body as { enabled: boolean };
    (ctl as any).scheduler.toggle(req.params.id, !!enabled);
    res.json({ ok: true });
  });

  r.delete('/schedule/:id', (req, res) => {
    (ctl as any).scheduler.remove(req.params.id);
    res.json({ ok: true });
  });

  return r;
};

// ❌ remove any `export default r` from the old file
