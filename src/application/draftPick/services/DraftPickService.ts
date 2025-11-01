import type { 
  CreateDraftPickDto, 
  UpdateDraftPickDto, 
  DraftPickResponseDto,
  DraftPickWithRelationsDto,
  DraftPickQueryFilters 
} from '../dto/DraftPickDto';
import type { IDraftPickRepository } from '../../../infrastructure/repositories/IDraftPickRepository';

export class DraftPickService {
  constructor(private readonly draftPickRepository: IDraftPickRepository) {}

  async create(dto: CreateDraftPickDto): Promise<DraftPickResponseDto> {
    this.validateCreateDto(dto);
    return await this.draftPickRepository.create(dto);
  }

  async findById(id: number): Promise<DraftPickResponseDto | null> {
    if (id <= 0) {
      throw new Error('Invalid draft pick ID');
    }
    return await this.draftPickRepository.findById(id);
  }

  async findAll(filters?: DraftPickQueryFilters): Promise<DraftPickResponseDto[]> {
    return await this.draftPickRepository.findAll(filters);
  }

  async update(id: number, dto: UpdateDraftPickDto): Promise<DraftPickResponseDto> {
    if (id <= 0) {
      throw new Error('Invalid draft pick ID');
    }
    
    const existingPick = await this.draftPickRepository.findById(id);
    if (!existingPick) {
      throw new Error(`Draft pick with id ${id} not found`);
    }

    return await this.draftPickRepository.update(id, dto);
  }

  async delete(id: number): Promise<void> {
    if (id <= 0) {
      throw new Error('Invalid draft pick ID');
    }

    const existingPick = await this.draftPickRepository.findById(id);
    if (!existingPick) {
      throw new Error(`Draft pick with id ${id} not found`);
    }

    await this.draftPickRepository.delete(id);
  }

  async fetchAllWithRelations(): Promise<DraftPickWithRelationsDto[]> {
    return await this.draftPickRepository.fetchAllWithRelations();
  }

  async fetchByYear(draftYear: number): Promise<DraftPickWithRelationsDto[]> {
    if (draftYear < 1900 || draftYear > new Date().getFullYear() + 10) {
      throw new Error('Invalid draft year');
    }
    return await this.draftPickRepository.fetchByYear(draftYear);
  }

  async fetchByTeamAndYear(
    currentTeamId: number, 
    draftYear: number
  ): Promise<DraftPickWithRelationsDto[]> {
    if (currentTeamId <= 0) {
      throw new Error('Invalid team ID');
    }
    if (draftYear < 1900 || draftYear > new Date().getFullYear() + 10) {
      throw new Error('Invalid draft year');
    }
    return await this.draftPickRepository.fetchByTeamAndYear(currentTeamId, draftYear);
  }

  private validateCreateDto(dto: CreateDraftPickDto): void {
    if (dto.round < 1 || dto.round > 20) {
      throw new Error('Round must be between 1 and 20');
    }
    if (dto.pickNumber < 1 || dto.pickNumber > 50) {
      throw new Error('Pick number must be between 1 and 50');
    }
    if (dto.draftYear < 1900 || dto.draftYear > new Date().getFullYear() + 10) {
      throw new Error('Invalid draft year');
    }
    if (dto.currentTeamId <= 0) {
      throw new Error('Invalid current team ID');
    }
  }
}