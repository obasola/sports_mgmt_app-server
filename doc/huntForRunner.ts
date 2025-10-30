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
  queue = async (req: Request, res: Response) => {
    const job = await this.queueJob.execute(req.body);
    if (req.body?.autoStart) {
      await runJobAdapter(this.runJob, job.id!);
    }
    res.status(201).json(this.toDto(job));
  };

  // POST /jobs/:id/run
  run = async (req: Request, res: Response) => {
    await runJobAdapter(this.runJob, Number(req.params.id));
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

// src/application/jobs/services/RunJobService.ts
import { JobRepository } from '../../../domain/jobs/repositories/JobRepository';
import { JobLogRepository } from '../../../domain/jobs/repositories/JobLogRepository';
import { Job } from '../../../domain/jobs/entities/Job';
import { JobStatus } from '../../../domain/jobs/value-objects/JobStatus';
import { InProcessJobRunner, RunResult } from '../../../infrastructure/queue/InProcessJobRunner';
import { JobLogEmitter } from '../../../infrastructure/queue/JobLogEmitter';
import { JobLog, LogLevel } from '@/domain/jobs/entities/JobLog';

export class RunJobService {
  constructor(
    private readonly jobs: JobRepository,
    private readonly logs: JobLogRepository,
    private readonly runner: InProcessJobRunner,
    private readonly emitter: JobLogEmitter
  ) {}

  async execute(jobId: number): Promise<Job> {
    const job = await this.jobs.findById(jobId);
    if (!job) throw new Error('Job not found');

    if (![JobStatus.PENDING].includes(job.status)) {
      throw new Error(`Job not runnable from status ${job.status}`);
    }

    job.start();
    await this.jobs.update(job);

    try {
      const res: RunResult = await this.runner.run(job, {
        log: async (level: LogLevel, message: string) => {
          // ✅ New log => id must be null; jobId is the job's id
          const saved = await this.logs.append(
            new JobLog(null, job.id!, level, message, new Date())
          );

          // ✅ Emit with the DB-assigned log id (if your emitter signature supports it)
          // If your emitter is emit(jobId, level, message) without id, just omit saved.id.
          this.emitter.emit(job.id!, level, message, saved.id ?? undefined);
        },
        shouldCancel: async () => {
          const latest = await this.jobs.findById(job.id!);
          return latest?.status === JobStatus.CANCELED;
        },
      });

      // Map RunResult fields to your Job.complete(...) shape
      job.complete(res.code ?? 'OK', (res as any).result ?? (res as any).data ?? null);
      await this.jobs.update(job);
      return job;
    } catch (err: any) {
      job.fail('ERROR', { message: err?.message ?? String(err) });
      await this.jobs.update(job);
      throw err;
    }
  }
}

// ==========================
// src/bootstrap/jobModule.ts
// File: src/bootstrap/jobsModule.ts
// ==========================
import { PrismaClient } from '@prisma/client';

// Infra
import { PrismaJobRepository } from '../infrastructure/repositories/PrismaJobRepository';
import { PrismaJobLogRepository } from '../infrastructure/repositories/PrismaJobLogRepository';
import { JobLogEmitter } from '../infrastructure/queue/JobLogEmitter';
import { InProcessJobRunner } from '../infrastructure/queue/InProcessJobRunner';
import { CronScheduler } from '../infrastructure/schedule/CronScheduler';

// App services (note the exact names/paths)
import { QueueJobService } from '../application/jobs/services/QueueJobService';
import { RunJobService } from '../application/jobs/services/RunJobService';
import { CancelJobService } from '../application/jobs/services/CancelJobService';
import { ListJobsService } from '../application/jobs/services/ListJobService';
import { GetJobDetailService } from '../application/jobs/services/GetJobDetailService';
import  GetJobLogsService  from '../application/jobs/services/GetJobLogService';
import { StreamJobLogsService } from '../application/jobs/services/StreamJobLogService';
import { ScheduleJobService } from '../application/jobs/services/ScheduleJobService';
import { prisma } from '../infrastructure/prisma';

// Presentation
import { JobController } from '../presentation/controllers/JobController';
import { buildJobRoutes } from '../presentation/routes/jobRoutes';

// Domain
import { JobType } from '../domain/jobs/value-objects/JobType';

export function buildJobsModule() {

  // repos + infra singletons
  const jobRepo = new PrismaJobRepository(prisma);
  const logRepo = new PrismaJobLogRepository(prisma);
  const emitter = new JobLogEmitter();
  const runner = new InProcessJobRunner(); // <- runner needs deps

  // Register job handlers (ALIGN with your enum names + ctx API)
  // If your JobType uses UPPER_CASE members (recommended):
  runner.register(JobType.SYNC_TEAMS, async (payload, ctx) => {
    await ctx.log('info', 'Invoking SyncTeamsService...');
    if (await ctx.shouldCancel?.()) return { code: 'canceled' };
    // TODO: call your real SyncTeamsService here
    await new Promise(r => setTimeout(r, 500));
    await ctx.log('info', 'SyncTeams completed');
    return { code: 'ok', data: { synced: true } };
  });

  runner.register(JobType.BACKFILL_SEASON, async (payload, ctx) => {
    const p = (payload ?? {}) as { seasonYear?: number };
    await ctx.log('info', `Backfilling season year=${p.seasonYear ?? 'n/a'}`);
    if (await ctx.shouldCancel?.()) return { code: 'canceled' };
    // TODO: call your real BackfillSeasonService here
    await new Promise(r => setTimeout(r, 1000));
    await ctx.log('info', 'BackfillSeason completed');
    return { code: 'ok', data: { year: p.seasonYear, games: 256 } };
  });

  // application services
  const queue = new QueueJobService(jobRepo);
  // Your RunJobService currently wants 4 args -> pass them:
  const run = new RunJobService(jobRepo, logRepo, runner, emitter);
  const cancel = new CancelJobService(jobRepo);
  const list = new ListJobsService(jobRepo);
  const getDetail = new GetJobDetailService(jobRepo);
  const getLogs = new GetJobLogsService(logRepo);
  const stream = new StreamJobLogsService(emitter);
  const scheduler = new ScheduleJobService(new CronScheduler(queue, run));

  // controller + routes
  const ctl = new JobController(queue, run, cancel, list, getDetail, getLogs, scheduler);
  const routes = buildJobRoutes(ctl);

  return { routes, prisma, runner, scheduler };
}


// I think this is the a'runner"
// src/services/importNflScores.ts
import {
  EspnScoreboardClient,
  SeasonType,
  EspnEvent,
  EspnCompetition,
} from '../infrastructure/scoreboardClient';
import { IGameRepository } from '../domain/game/repositories/IGameRepository';
import { IJobLogger } from '../jobs/IJobLogger';

/**
 * Imports a single week (by seasonType + week) from ESPN Scoreboard API
 * and upserts into Game table. Idempotent via espnCompetitionId.
 */
export class ImportNflScoresService {
  constructor(
    private readonly client: EspnScoreboardClient,
    private readonly repo: IGameRepository,
    private readonly job: IJobLogger
  ) {}

  /** Primary entry used by codebase (what your callers were missing). */
  async run(params: { seasonYear: string; seasonType: SeasonType; week: number }): Promise<{
    seasonYear: string;
    seasonType: SeasonType;
    week: number;
    totalEvents: number;
    upserts: number;
    skipped: number;
    scoreChanges: { homeTeam: string; homeScore: number; awayTeam: string; awayScore: number }[];
  }> {
    const { seasonYear, seasonType, week } = params;
    const { jobId } = await this.job.start({
      jobType: 'IMPORT_SCORES_WEEK',
      params: { seasonYear, seasonType, week },
    });

    try {
      const sb = await this.client.getWeekScoreboard(seasonYear, seasonType, week);
      const events = sb.events ?? [];

      let upserts = 0;
      let skipped = 0;
      const scoreChanges: {
        homeTeam: string;
        homeScore: number;
        awayTeam: string;
        awayScore: number;
      }[] = [];

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        for (const comp of event.competitions ?? []) {
          const result = await this.importCompetition(event, comp, seasonType, seasonYear, week);
          if (result.ok) {
            upserts++;
            if (result.scoreChanged) {
              scoreChanges.push({
                homeTeam: result.homeName ? result.homeName : '',
                homeScore: result.homeScore ? result.homeScore : 0,
                awayTeam: result.awayName ? result.awayName : '',
                awayScore: result.awayScore ? result.awayScore : 0,
              });
              // now log results
              if (scoreChanges.length) {
                await this.job.log(jobId, {
                 // level: 'info',
                  message: `Score changes: ${scoreChanges
                    .map((g) => `${g.homeTeam} ${g.homeScore}-${g.awayScore} ${g.awayTeam}`)
                    .join('; ')}`,
                });
              }
            }
          } else {
            skipped++;
          }
        }
      }

      await this.job.succeed(jobId, {
        seasonYear,
        seasonType,
        week,
        totalEvents: events.length,
        upserts,
        skipped,
      });
      return {
        seasonYear,
        seasonType,
        week,
        totalEvents: events.length,
        upserts,
        skipped,
        scoreChanges,
      };
    } catch (err: any) {
      await this.job.fail(jobId, err?.message ?? 'Import week failed', { seasonType, week });
      throw err;
    }
  }

  /** Optional: some callers prefer an explicit year param. */
  async importWeek(params: { seasonYear: string; seasonType: SeasonType; week: number }) {
    // ESPN per-week scoreboard doesn’t need year to fetch,
    // but we still return the computed seasonYear from ESPN to confirm.
    return this.run({
      seasonYear: params.seasonYear,
      seasonType: params.seasonType,
      week: params.week,
    });
  }

  // ------------ internals ------------

  private async importCompetition(
    event: EspnEvent,
    comp: EspnCompetition,
    seasonType: SeasonType,
    seasonYear: string,
    week: number,
    jobId?: number
  ): Promise<{
    ok: boolean;
    scoreChanged?: boolean | null;
    homeName?: string;
    homeScore?: number;
    awayName?: string;
    awayScore?: number;
  }> {
    const home = comp.competitors.find((c) => c.homeAway === 'home');
    const away = comp.competitors.find((c) => c.homeAway === 'away');
    if (!home || !away) return { ok: false };

    const homeId =
      (await this.repo.findTeamIdByEspnTeamId(home.team.id)) ??
      (await this.repo.findTeamIdByAbbrev(home.team.abbreviation));
    const awayId =
      (await this.repo.findTeamIdByEspnTeamId(away.team.id)) ??
      (await this.repo.findTeamIdByAbbrev(away.team.abbreviation));
    if (!homeId || !awayId) return { ok: false };

    const newHomeScore = home.score ? Number(home.score) : null;
    const newAwayScore = away.score ? Number(away.score) : null;

    // Retrieve previous scores (if any)
    const prev = await this.repo.findByEspnCompetitionId(comp.id);
    const scoreChanged =
      prev && (prev.homeScore !== newHomeScore || prev.awayScore !== newAwayScore);

    await this.repo.upsertByKey(
      {
        espnCompetitionId: comp.id,
        espnEventId: event.id,
        seasonYear,
        preseason: seasonType,
        gameWeek: week,
        homeTeamId: homeId,
        awayTeamId: awayId,
      },
      {
        seasonYear,
        gameWeek: week,
        preseason: seasonType,
        gameDate: comp.date ? new Date(comp.date) : null,
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        gameStatus: comp.status?.type?.completed ? 'completed' : 'scheduled',
        espnEventId: event.id,
        espnCompetitionId: comp.id,
      }
    );

    return {
      ok: true,
      scoreChanged,
      homeName: home.team.displayName,
      homeScore: newHomeScore ?? 0,
      awayName: away.team.displayName,
      awayScore: newAwayScore ?? 0,
    };
  }
}

// src/services/jobService.ts
import { apiService } from './api';
import type { 
  Job, 
  CreateJobRequest, 
  CreatePFDraftScraperRequest,
  JobType,
  JobStatus 
} from '../types/Job';

export interface JobSearchParams {
  type?: JobType;
  status?: JobStatus;
  createdBy?: string;
  fromDate?: string;
  toDate?: string;
}

class JobService {
  private readonly basePath = '/jobs';

  async createJob(request: CreateJobRequest): Promise<Job> {
    const response = await apiService.post<{ success: boolean; data: Job }>(
      this.basePath,
      request
    );
    return response.data.data;
  }

  async createPFDraftScraperJob(request: CreatePFDraftScraperRequest): Promise<Job> {
    const response = await apiService.post<{ success: boolean; data: Job }>(
      `${this.basePath}/pf-draft-scraper`,
      request
    );
    return response.data.data;
  }

  async getJob(id: number): Promise<Job> {
    const response = await apiService.get<{ success: boolean; data: Job }>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  async listJobs(params?: JobSearchParams): Promise<Job[]> {
    const response = await apiService.get<{ success: boolean; data: Job[] }>(
      this.basePath,
      { params }
    );
    return response.data.data;
  }

  async cancelJob(id: number): Promise<void> {
    await apiService.post<{ success: boolean; message: string }>(
      `${this.basePath}/${id}/cancel`
    );
  }

  async getJobStatus(id: number): Promise<Job> {
    const response = await apiService.get<{ success: boolean; data: Job }>(
      `${this.basePath}/${id}/status`
    );
    return response.data.data;
  }
}

export const jobService = new JobService();

// src/services/JobsApi.ts
import http from './http'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'canceled'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export interface ScheduleItem { id: string; cron: string; enabled: boolean }

export type JobDTO = {
  id: number
  type: string
  status: JobStatus
  createdAt: string
  startedAt?: string | null
  finishedAt?: string | null
  cancelAt?: string | null
  cancelReason?: string | null
  resultCode?: string | null
  resultJson?: any
  payload?: any
}

export type JobLogDTO = {
  id: number
  jobId: number
  level: LogLevel
  message: string
  createdAt: string
}

export type ListResponse<T> = { total: number; items: T[] }

export const JobsApi = {
  list: async (params: { status?: string; type?: string; page?: number; pageSize?: number }) =>
    (await http.get<ListResponse<JobDTO>>('/jobs', { params })).data,

  detail: async (id: number) => (await http.get<JobDTO>(`/jobs/${id}`)).data,

  logs: async (id: number, args?: { afterId?: number }) =>
    (await http.get<JobLogDTO[]>(`/jobs/${id}/logs`, { params: args })).data,

  queue: async (req: { type: string; payload?: any; autoStart?: boolean }) =>
    (await http.post<JobDTO>('/jobs', req)).data,

  run: async (id: number) => (await http.post(`/jobs/${id}/run`, {})).data,

  cancel: async (id: number, reason?: string) =>
    (await http.post(`/jobs/${id}/cancel`, { reason })).data,

  schedule: {
    add: async (args: {
      id: string
      cron: string
      job: { type: string; payload?: any }
      active?: boolean
    }) => (await http.post('/jobs/schedule', args)).data,

    list: async () =>
      (await http.get('/jobs/schedule')).data as Array<{
        id: string
        cron: string
        enabled: boolean
        req?: any
      }>,

    toggle: async (id: string, enabled: boolean) =>
      (await http.post(`/jobs/schedule/${id}/toggle`, { enabled })).data,

    remove: async (id: string) => (await http.delete(`/jobs/schedule/${id}`)).data,
  },
}

// src/services/Jobs.ts
import axios from './http';

export interface JobDto {
  id: number;
  type: string;
  status: string; // pending|running|completed|failed|canceled
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  cancelAt?: string | null;
  cancelReason?: string | null;
  resultCode?: string | null;
  resultJson?: unknown | null;
}

export interface JobLogDto {
  id: number;
  jobId: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  createdAt: string; // ISO
}

export interface ListResponse<T> { total: number; items: T[] }
export interface ScheduleItem { id: string; cron: string; enabled: boolean }

export interface QueueJobBody { type: string; payload?: any; autoStart?: boolean }
export interface ToggleBody { enabled: boolean }
export interface CancelBody { reason?: string }

export const JobApiService = {
  list(params: { status?: string; type?: string; page?: number; pageSize?: number }): Promise<ListResponse<JobDto>> {
    return axios.get('/jobs', { params }).then(r => r.data);
  },
  detail(id: number): Promise<JobDto> {
    return axios.get(`/jobs/${id}`).then(r => r.data);
  },
  logs(id: number, afterId?: number): Promise<JobLogDto[]> {
    return axios.get(`/jobs/${id}/logs`, { params: { afterId } }).then(r => r.data);
  },
  queue(body: QueueJobBody): Promise<JobDto> {
    return axios.post('/jobs', body).then(r => r.data);
  },
  run(id: number): Promise<JobDto> {
    return axios.post(`/jobs/${id}/run`).then(r => r.data);
  },
  cancel(id: number, body?: CancelBody): Promise<JobDto> {
    return axios.post(`/jobs/${id}/cancel`, body).then(r => r.data);
  },
  schedList(): Promise<ScheduleItem[]> {
    return axios.get('/jobs/schedule').then(r => r.data);
  },
  schedAdd(body: { id: string; cron: string; job: QueueJobBody; active?: boolean }): Promise<unknown> {
    return axios.post('/jobs/schedule', body).then(r => r.data);
  },
  schedToggle(id: string, body: ToggleBody): Promise<unknown> {
    return axios.post(`/jobs/schedule/${id}/toggle`, body).then(r => r.data);
  },
  schedRemove(id: string): Promise<unknown> {
    return axios.delete(`/jobs/schedule/${id}`).then(r => r.data);
  },
};

// src/components/jobs/JobList.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useJobStore } from '../../stores/jobStore';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import { formatDistanceToNow } from 'date-fns';
import type { Job, JobStatus } from '../../types/Job';

const router = useRouter();
const jobStore = useJobStore();

const loading = ref(false);

const jobs = computed(() => jobStore.jobs);

onMounted(async () => {
  await loadJobs();
});

async function loadJobs() {
  loading.value = true;
  try {
    await jobStore.fetchJobs();
  } finally {
    loading.value = false;
  }
}
/*
await jobStore.createJob({
  type: 'IMPORT_SCORES_WEEK',
  payload: { seasonYear: 2025, seasonType: 2, week: 7 },
});
*/
function viewJobDetail(job: Job) {
  router.push({ name: 'JobDetail', params: { id: job.id } });
}

function getStatusSeverity(status: JobStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'RUNNING':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'danger';
    case 'CANCELLED':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getJobTypeLabel(type: string): string {
  switch (type) {
    case 'PF_DRAFT_SCRAPER':
      return 'Pro Football Draft Scraper';
    case 'ESPN_PLAYER_IMPORT':
      return 'ESPN Player Import';
    case 'NFL_STATS_IMPORT':
      return 'NFL Stats Import';
    default:
      return type;
  }
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}
</script>

<template>
  <div class="flex flex-column gap-3">
    <div class="flex justify-content-between align-items-center">
      <h2 class="text-2xl font-semibold m-0">Jobs</h2>
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        :loading="loading"
        @click="loadJobs"
      />
    </div>

    <DataTable
      :value="jobs"
      :loading="loading"
      stripedRows
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50]"
      dataKey="id"
      @row-click="(event) => viewJobDetail(event.data)"
      class="cursor-pointer"
    >
      <Column field="id" header="ID" :sortable="true" style="width: 80px" />
      
      <Column field="type" header="Type" :sortable="true">
        <template #body="{ data }">
          <span class="font-semibold">{{ getJobTypeLabel(data.type) }}</span>
        </template>
      </Column>

      <Column field="status" header="Status" :sortable="true" style="width: 140px">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
        </template>
      </Column>

      <Column field="progress" header="Progress" style="width: 200px">
        <template #body="{ data }">
          <div class="flex flex-column gap-1">
            <ProgressBar :value="data.progress" :showValue="false" style="height: 8px" />
            <small class="text-color-secondary">
              {{ data.progress }}% ({{ data.processedItems }}/{{ data.totalItems }})
            </small>
          </div>
        </template>
      </Column>

      <Column field="createdAt" header="Created" :sortable="true" style="width: 150px">
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </Column>

      <Column header="Actions" style="width: 100px">
        <template #body="{ data }">
          <Button
            icon="pi pi-eye"
            text
            rounded
            @click.stop="viewJobDetail(data)"
            v-tooltip.top="'View Details'"
          />
        </template>
        
      </Column>

      <template #empty>
        <div class="text-center p-4 text-color-secondary">
          No jobs found
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--surface-hover);
}
</style>



