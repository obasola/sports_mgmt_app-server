import { Router } from 'express'
import { enqueueImport, listJobs, getJob, getJobLogs } from '@/presentation/controllers/jobController'

const r = Router()
r.get('/jobs', listJobs)
r.get('/jobs/:id', getJob)
r.get('/jobs/:id/logs', getJobLogs)
r.post('/jobs/import-nfl-season', enqueueImport)

export default r
