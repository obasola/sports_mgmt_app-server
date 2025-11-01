import type { 
  CreateDraftPickDto, 
  UpdateDraftPickDto, 
  DraftPickResponseDto,
  DraftPickWithRelationsDto,
  DraftPickQueryFilters 
} from '../../application/draftPick/dto/DraftPickDto';

export interface IDraftPickRepository {
  create(dto: CreateDraftPickDto): Promise<DraftPickResponseDto>;
  findById(id: number): Promise<DraftPickResponseDto | null>;
  findAll(filters?: DraftPickQueryFilters): Promise<DraftPickResponseDto[]>;
  update(id: number, dto: UpdateDraftPickDto): Promise<DraftPickResponseDto>;
  delete(id: number): Promise<void>;
  fetchAllWithRelations(): Promise<DraftPickWithRelationsDto[]>;
  fetchByYear(draftYear: number): Promise<DraftPickWithRelationsDto[]>;
  fetchByTeamAndYear(currentTeamId: number, draftYear: number): Promise<DraftPickWithRelationsDto[]>;
}