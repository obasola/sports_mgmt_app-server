// src/application/jobs/services/ScheduleJobService.ts
import { CronScheduler } from '../../../infrastructure/schedule/CronScheduler';
import { CreateJobRequest } from '../dto/CreateJobRequest';

export class ScheduleJobService {
  constructor(private readonly scheduler: CronScheduler) {}
  add(name: string, cron: string, jobFactory: () => Promise<void>, active = true) {
    this.scheduler.register(name, cron, jobFactory, active);
  }
  remove(name: string) { this.scheduler.unregister(name); }
  list() { return this.scheduler.list(); }
}
