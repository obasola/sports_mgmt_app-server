// src/application/draft/service/DraftService.ts
 
import  { DraftPickRepository } from '../../../domain/draft/repositories/DraftPickRepository'
import { ProspectRepository as ProspectRepository} from '../../../domain/prospect/repositories/ProspectRepository'
import { TeamNeedRepository as TeamNeedRepository } from '../../../domain/teamNeed/repositories/TeamNeedRepository'
import { DraftPick} from '../../../domain/draft/entity/DraftPick'
import { DraftSelection } from '../dto/DraftSelection'
import { Prospect } from '@/domain/prospect/entities/Prospect'

export class DraftService {
  constructor(
//    private draftPickRepository: DraftPickRepository,
    private prospectRepository: ProspectRepository,
    private teamNeedRepository: TeamNeedRepository
  ) {}

  async getDraftOrder(year: number) {
    /*
    const picks = await this.draftPickRepository.findByDraftYear(year)
    const picksWithTeams = await Promise.all(
      picks.map(async (pick) => ({
        ...pick,
        team: await this.draftPickRepository.getTeamForPick(pick.id!)
      }))
        
    )
    
    return {
      picks: picksWithTeams.sort((a, b) => a.pickNumber - b.pickNumber),
      currentPickIndex: picksWithTeams.findIndex(p => !p.used)
    }
      */
  }

  async makePick(pickId: number, prospectId: number): Promise<DraftSelection> {
    /* Update the draft pick
    await this.draftPickRepository.updatePick(pickId, {
      prospectId,
      used: true
    })

    // Update the prospect
    await this.prospectRepository.updateProspect(prospectId, {
        drafted: true,
        draftPickId: pickId,
        id: undefined,
        firstName: '',
        lastName: '',
        position: '',
        college: '',
        height: 0,
        weight: 0,
        handSize: undefined,
        armLength: undefined,
        homeCity: undefined,
        homeState: undefined,
        fortyTime: undefined,
        tenYardSplit: undefined,
        verticalLeap: undefined,
        broadJump: undefined,
        threeCone: undefined,
        twentyYardShuttle: undefined,
        benchPress: undefined,
        draftYear: undefined,
        teamId: undefined,
        createdAt: undefined,
        updatedAt: undefined,
    })

    // Return selection details
    //const pick = await this.draftPickRepository.findById(pickId)
    const prospect = await this.prospectRepository.findById(prospectId)
    
    return new DraftSelection(
      pickId,
      prospectId, 
   //   pick ? pick.currentTeamId : 0,
      new Date()
    )
      */
     return new DraftSelection(0,0,0,new Date());
  }

  async generateAIPick(pickId: number): Promise<{ prospectId: number }> {
    /*
    const pick = await this.draftPickRepository.findById(pickId)
    const teamNeeds = await this.teamNeedRepository.findByTeamId(pick ? pick.currentTeamId : 0)
    const availableProspects = await this.prospectRepository.findAvailable()

    // Simple AI logic: pick best available prospect at position of need
    const needPositions = teamNeeds.map(need => need.position)
    
    let selectedProspect = availableProspects.find(p => 
      needPositions.includes(p.position)
    )
    
    // If no position of need available, pick best overall
    if (!selectedProspect) {
      selectedProspect = availableProspects[0]
    }

    return { prospectId: selectedProspect.id! }
    */
   return { prospectId: 0 }
  }
}