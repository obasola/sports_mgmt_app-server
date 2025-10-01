import { Router } from 'express'
const r = Router()
r.get('/health', (_req, res) => res.json({ status: 'ok' }))
r.get('/ping', (_req, res) => res.json({ pong: true }))
export default r
