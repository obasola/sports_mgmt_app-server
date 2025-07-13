// src/presentation/controllers/DraftController.ts
 
import { Request, Response } from 'express'
import { DraftService } from '../../application/draft/service/DraftService'
import { ApiResponse } from '../../shared/types/common'

export class DraftController {
  constructor(private draftService: DraftService) {}

  async getDraftOrder(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.params.year)
      const draftOrder = await this.draftService.getDraftOrder(year)
      
      const response: ApiResponse<any> = {
        success: true,
        data: draftOrder
      }
      res.json(response)
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async makePick(req: Request, res: Response): Promise<void> {
    try {
      const { pickId, prospectId } = req.body
      const selection = await this.draftService.makePick(pickId, prospectId)
      
      const response: ApiResponse<any> = {
        success: true,
        data: selection
      }
      res.json(response)
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getAIPick(req: Request, res: Response): Promise<void> {
    try {
      const pickId = parseInt(req.params.pickId)
      const aiPick = await this.draftService.generateAIPick(pickId)
      
      const response: ApiResponse<any> = {
        success: true,
        data: aiPick
      }
      res.json(response)
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
