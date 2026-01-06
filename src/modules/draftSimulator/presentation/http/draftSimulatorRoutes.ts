// sports_mgmt_app_server/src/modules/draftSimulator/presentation/http/draftSimulatorRoutes.ts
import { Router } from 'express'
import type { DraftSimulatorController } from './DraftSimulatorController'

export function buildDraftSimulatorRoutes(controller: DraftSimulatorController): Router {
  const r = Router()
  r.post('/draft-simulator/simulations', controller.createSimulation)
  r.post('/draft-simulator/simulations/:id/start', controller.startSimulation)
  r.get('/draft-simulator/simulations/:id', controller.getDraftState)
  r.get('/draft-simulator/simulations/:id/prospects', controller.listProspects)
  r.post('/draft-simulator/simulations/:id/picks', controller.makePick)
  r.post('/draft-simulator/simulations/:id/simulate-next', controller.simulateNext)
  r.get('/draft-simulator/simulations/:id/team-console', controller.getTeamConsole)
  return r
}
