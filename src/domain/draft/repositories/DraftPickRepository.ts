
// src/infrastructure/repositories/DraftPickRepository.ts

import { DraftPick } from '@/domain/draft/entity/DraftPick'
import { PrismaClient } from '@prisma/client'
 
export interface DraftPickRepository {
  findByDraftYear(year: number): Promise<any[]>;
  findById(id: number): Promise<DraftPick>;
  updatePick(id: number, data: { prospectId?: number; used?: boolean }): Promise<void>;
  getTeamForPick(pickId: number): Promise<DraftPick>;
  create(draftPick: Omit<DraftPick, 'id'>): Promise<DraftPick>;
}