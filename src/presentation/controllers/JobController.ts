// ==========================
// File: src/presentation/controllers/JobController.ts
// ==========================
import { Request, Response } from 'express';
import { QueueJobService } from '../../application/jobs/services/QueueJobService';
import { RunJobService } from '../../application/jobs/services/RunJobService';
import { CancelJobService } from '../../application/jobs/services/CancelJobService';
import { ListJobsService } from '../../application/jobs/services/ListJobService';
import { GetJobDetailService } from '../../application/jobs/services/GetJobDetailService';
import GetJobLogsService from '../../application/jobs/services/GetJobLogService';
import { ScheduleJobService } from '../../application/jobs/services/ScheduleJobService';

// Defensive adapter to support either `.exec` or `.run`
async function runJobAdapter(runSvc: RunJobService, id: number) {
  const anyRun = runSvc as unknown as {
    exec?: (id: number) => Promise<void>;
    run?: (id: number) => Promise<void>;
  };
  if (typeof anyRun.exec === 'function') return anyRun.exec(id);
  if (typeof anyRun.run === 'function') return anyRun.run(id);
  throw new Error('RunJobService must expose exec(jobId:number) or run(jobId:number)');
}


export class JobController {
  constructor(
    private readonly queueJob: QueueJobService,
    private readonly runJob: RunJobService,
    private readonly cancelJob: CancelJobService,
    private readonly listJobs: ListJobsService,
    private readonly getJob: GetJobDetailService,
    private readonly getLogs: GetJobLogsService,
    private readonly scheduler: ScheduleJobService
  ) {}

  // POST /jobs
// JobController.queue (fixed)
queue = async (req: Request, res: Response) => {
  const job = await this.queueJob.execute(req.body);

  if (req.body?.autoStart) {
    // fire-and-forget (don’t await)
    runJobAdapter(this.runJob, job.id!).catch(err =>
      console.error(`Job ${job.id} failed to start:`, err)
    );
  }

  // respond immediately so UI sees the new job
  res.status(201).json(this.toDto(job));
};


  // POST /jobs/:id/run
run = async (req: Request, res: Response) => {
  // no await here
  runJobAdapter(this.runJob, Number(req.params.id)).catch(console.error);
  res.status(202).json({ ok: true });
};

  // POST /jobs/:id/cancel
  cancel = async (req: Request, res: Response) => {
    await this.cancelJob.execute(Number(req.params.id), req.body?.reason);
    res.json({ ok: true });
  };

  // GET /jobs?status=&type=&page=&pageSize=
  // GET /jobs?status=&type=&page=&pageSize=
  list = async (req: Request, res: Response) => {
    const { status, type, page, pageSize } = req.query;
    const pg = {
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    } as any; // Pagination

    const filter = {
      status: status as any,
      type: type as any,
    } as any; // ListJobsFilter

    const result = await this.listJobs.execute(filter, pg);
    res.json({ total: result.total, items: result.items.map((j) => this.toDto(j)) });
  };

  // GET /jobs/:id
  detail = async (req: Request, res: Response) => {
    const job = await this.getJob.execute(Number(req.params.id));
    res.json(this.toDto(job));
  };

  // GET /jobs/:id/logs?afterId=
  logs = async (req: Request, res: Response) => {
    const jobId = Number(req.params.id);
    const afterId = req.query.afterId ? Number(req.query.afterId) : undefined;
    const items = await this.getLogs.execute(jobId, afterId);
    res.json(
      items.map((l) => ({
        id: (l as any).id ?? (l as any).props?.id,
        jobId: (l as any).jobId ?? (l as any).props?.jobId,
        level: (l as any).level ?? (l as any).props?.level,
        message: (l as any).message ?? (l as any).props?.message,
        createdAt:
          ((l as any).createdAt ?? (l as any).props?.createdAt)?.toISOString?.() ??
          new Date().toISOString(),
      }))
    );
  };

  // Utility: map Job -> DTO without assuming a specific entity shape
  private toDto(job: any) {
    const get = (k: string) => job?.[k] ?? job?.props?.[k] ?? null;
    const dateIso = (v: any) =>
      v && typeof v.toISOString === 'function' ? v.toISOString() : (v ?? null);
    return {
      id: get('id'),
      type: String(get('type')),
      status: String(get('status')),
      createdAt: dateIso(get('createdAt')),
      startedAt: dateIso(get('startedAt')),
      finishedAt: dateIso(get('finishedAt')),
      cancelAt: dateIso(get('cancelAt')),
      cancelReason: get('cancelReason'),
      resultCode: get('resultCode'),
      resultJson: get('resultJson'),
    };
  }
}
