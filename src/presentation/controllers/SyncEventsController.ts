// src/presentation/controllers/SyncEventsController.ts
import { Request, Response } from 'express';
import { JobType } from '@/domain/jobs/value-objects/JobType';

import { queueJobService, syncWeekEventsService } from '@/infrastructure/dependencies';
/*
export class SyncEventsController {
  constructor(private readonly jobRunner: JobRunner) {}

  kickoffWeekly = async (req: Request, res: Response) => {
    const { year, seasonType, week } = req.body

    if (!year || !seasonType || !week) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const job = await this.jobRunner.dispatch(
      JobType.NFL_EVENTS_WEEKLY,
      { year, seasonType, week }
    )

    return res.json({ success: true, job })
  }
}
*/
// src/presentation/controllers/SyncEventsController.ts

export class SyncEventsController {
  kickoffWeekly = async (req: Request, res: Response) => {
    try {
      const { year, seasonType, week } = req.body;

      if (!year || !seasonType || !week) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const job = await queueJobService.execute({
        type: JobType.NFL_EVENTS_WEEKLY,
        payload: {
          year: Number(year),
          seasonType: Number(seasonType),
          week: Number(week),
        }
      })


      return res.json({ success: true, job });
    } catch (err) {
      console.error('kickoffWeekly error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Optional direct run (dev use only)
  runNow = async (req: Request, res: Response) => {
    const { year, seasonType, week } = req.body;
    const result = await syncWeekEventsService.sync(year, seasonType, week);
    return res.json({ success: true, processed: result.length });
  };
}
