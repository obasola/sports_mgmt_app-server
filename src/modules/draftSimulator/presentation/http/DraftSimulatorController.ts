// sports_mgmt_app_server/src/modules/draftSimulator/presentation/http/DraftSimulatorController.ts
import type { Request, Response } from 'express'

import type { CreateSimulationBody, ListProspectsQuery, MakePickBody } from './requestTypes'
import { CreateSimulationUseCase } from '../../application/usecases/CreateSimulationUseCase'
import { GetDraftStateUseCase } from '../../application/usecases/GetDraftStateUseCase'
import { ListProspectsUseCase } from '../../application/usecases/ListProspectsUseCase'
import { MakePickUseCase } from '../../application/usecases/MakePickUseCase'
import { SimulateNextPickUseCase } from '../../application/usecases/SimulateNextPickUseCase'
import { StartSimulationUseCase } from '../../application/usecases/StartSimulationUseCase'
import { GetTeamConsoleUseCase } from '../../application/usecases/GetTeamConsoleUseCase'

function parseId(param: string): number {
  const n = Number(param)
  if (!Number.isFinite(n) || n <= 0) throw new Error('Invalid id.')
  return n
}

export class DraftSimulatorController {
  public constructor(
    private readonly createUc: CreateSimulationUseCase,
    private readonly startUc: StartSimulationUseCase,
    private readonly getStateUc: GetDraftStateUseCase,
    private readonly listProspectsUc: ListProspectsUseCase,
    private readonly makePickUc: MakePickUseCase,
    private readonly simulateNextUc: SimulateNextPickUseCase,
    private readonly teamConsoleUc: GetTeamConsoleUseCase
  ) {}

  public createSimulation = async (req: Request<{}, unknown, CreateSimulationBody>, res: Response): Promise<void> => {
    try {
      const body = req.body
      const result = await this.createUc.execute({
        draftYear: body.draftYear,
        rounds: body.rounds,
        draftSpeed: body.draftSpeed,
        rankingSource: body.rankingSource,
        allowTrades: body.allowTrades,
        cpuCpuTrades: body.cpuCpuTrades,
        userTeamIds: body.userTeamIds
      })
      res.json(result)
    } catch (e: unknown) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to create simulation' })
    }
  }

  public startSimulation = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const id = parseId(req.params.id)
      const result = await this.startUc.execute(id)
      res.json(result)
    } catch (e: unknown) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to start simulation' })
    }
  }

  public getDraftState = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const id = parseId(req.params.id)
      const result = await this.getStateUc.execute(id)
      res.json(result)
    } catch (e: unknown) {
      res.status(404).json({ error: e instanceof Error ? e.message : 'Not found' })
    }
  }

  public getTeamConsole = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const id = parseId(req.params.id)
      const result = await this.teamConsoleUc.execute(id)
      res.json(result)
    } catch (e: unknown) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load team console' })
    }
  }

  public listProspects = async (req: Request<{ id: string }, unknown, unknown, ListProspectsQuery>, res: Response): Promise<void> => {
    try {
      const id = parseId(req.params.id)
      const result = await this.listProspectsUc.execute(id, {
        q: req.query.q,
        side: req.query.side ?? 'all',
        position: req.query.position
      })
      res.json(result)
    } catch (e: unknown) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to list prospects' })
    }
  }

  public makePick = async (req: Request<{ id: string }, unknown, MakePickBody>, res: Response): Promise<void> => {
    try {
      const id = parseId(req.params.id)
      const result = await this.makePickUc.execute(id, req.body)
      res.json(result)
    } catch (e: unknown) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to make pick' })
    }
  }

  public simulateNext = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const id = parseId(req.params.id)
      const result = await this.simulateNextUc.execute(id)
      res.json(result)
    } catch (e: unknown) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to simulate next pick' })
    }
  }
}
