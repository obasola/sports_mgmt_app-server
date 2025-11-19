import { Job } from '@/domain/jobs/entities/Job'
import { JobLog } from '@/domain/jobs/entities/JobLog'
import { JobLogRepository } from '@/domain/jobs/repositories/JobLogRepository'
import { LogLevel } from '@/domain/jobs/entities/JobLog'

export class JobLogWriter {
  constructor(
    private readonly job: Job,
    private readonly repo: JobLogRepository
  ) {}

  async write(level: LogLevel, message: string) {
    const log = new JobLog(null, this.job.id!, level, message)
    await this.repo.append(log)
  }

  info(msg: string) { return this.write('info', msg) }
  debug(msg: string) { return this.write('debug', msg) }
  warn(msg: string) { return this.write('warn', msg) }
  error(msg: string) { return this.write('error', msg) }
}
