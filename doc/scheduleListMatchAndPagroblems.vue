
scheduleList missing matchup team names, only 10 records showing, and pagination bar missing.
Also schedule showing TBD not team name. DevTools Network response confirms we have home/away teamIds: { "id": 18, "seasonYear": "2025", "gameWeek": 0, "preseason": 1, "gameDate": "2025-08-15T23:00:00.000Z", "homeTeamId": 62, "awayTeamId": 89, "gameLocation": "Mercedes-Benz Stadium", "gameCity": "Atlanta", "gameStateProvince": "GA", "gameCountry": "USA", "homeScore": 20, "awayScore": 23, "gameStatus": "scheduled", "fullLocation": "Mercedes-Benz Stadium, Atlanta, GA, USA", "winningTeamId": null, "isTie": false, "createdAt": "2025-09-01T18:23:01.000Z", "updatedAt": "2025-09-01T18:26:17.000Z" }, so getTeamName should have id yet this code must be getting invoked: // Map id (or abbreviation) to team name/colors using themeStore cache const getTeamName = (idOrAbbr: string | undefined): string => { if (!idOrAbbr) return 'TBD' const team = teams.value.find(t => String(t.id) === idOrAbbr || t.abbreviation === idOrAbbr) return team ? team.name : idOrAbbr }

// scheduleList
<!-- sports_mgmt_app_client/src/components/schedule/scheduleList.vue -->
<template>
  <div class="schedule-list">
    <div class="list-header bg-team-primary text-team-accent p-4 rounded-lg shadow-lg mb-6">
      <h2 class="text-2xl font-bold">
        <span v-if="currentTeam">{{ currentTeam.name }}</span>
        Schedules
      </h2>
      <ThemedButton @click="createSchedule" label="Create Schedule" icon="pi pi-plus" variant="secondary" />
    </div>

    <DataTable
      :value="scheduleStore.schedules"
      :loading="scheduleStore.loading"
      dataKey="id"
      :lazy="true"
      paginator
      :rows="rows"
      :first="first"
      :totalRecords="scheduleStore.pagination?.total ?? scheduleStore.schedules.length"
      :rowsPerPageOptions="[5,10,20,50]"
      @page="onPage"
      responsiveLayout="scroll"
      sortMode="multiple"
      :globalFilterFields="['gameLocation', 'gameCity', 'oppTeamConference']"
      class="themed-datatable"
    >
      <Column field="seasonYear" header="Season" sortable>
        <template #body="{ data }">
          <span class="font-semibold text-team-primary">{{ data.seasonYear }}</span>
        </template>
      </Column>

      <Column field="scheduleWeek" header="Week" sortable>
        <template #body="{ data }">
          <div class="week-badge bg-team-secondary text-team-accent px-2 py-1 rounded text-sm font-medium">
            Week {{ data.scheduleWeek }}
          </div>
        </template>
      </Column>

      <Column field="gameDate" header="Game Date" sortable>
        <template #body="{ data }">
          <span class="text-gray-700">{{ formatDate(data.gameDate) }}</span>
        </template>
      </Column>

      <!-- ✅ Corrected: use awayTeamId @ homeTeamId -->
      <Column header="Matchup">
        <template #body="{ data }">
          <div class="matchup">
            <span class="team">{{ getTeamName(data.awayTeamId) }}</span>
            <span class="mx-1">@</span>
            <span class="team">{{ getTeamName(data.homeTeamId) }}</span>
          </div>
        </template>
      </Column>

      <Column field="homeOrAway" header="Home/Away">
        <template #body="{ data }">
          <TeamAwareTag
            :value="data.homeOrAway || 'TBD'"
            :is-home="(data.homeOrAway || '').toUpperCase() === 'HOME'"
            class="home-away-tag"
          />
        </template>
      </Column>

      <Column field="gameLocation" header="Location">
        <template #body="{ data }">
          <span class="text-gray-600">{{ data.gameLocation }}</span>
        </template>
      </Column>

      <Column field="teamScore" header="Team Score" sortable>
        <template #body="{ data }">
          <div
            v-if="data.teamScore != null"
            class="score-display team-score"
            :class="{ 'winning-score': isWinningScore(data.teamScore, data.oppTeamScore) }"
          >
            {{ data.teamScore }}
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>
      </Column>

      <Column field="oppTeamScore" header="Opp Score" sortable>
        <template #body="{ data }">
          <div
            v-if="data.oppTeamScore != null"
            class="score-display opp-score"
            :class="{ 'winning-score': isWinningScore(data.oppTeamScore, data.teamScore) }"
          >
            {{ data.oppTeamScore }}
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>
      </Column>

      <Column field="wonLostFlag" header="Result">
        <template #body="{ data }">
          <GameResultTag v-if="data.wonLostFlag" :result="data.wonLostFlag" />
          <span v-else class="text-gray-400 text-sm">TBD</span>
        </template>
      </Column>

      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <ThemedButton @click="viewSchedule(data.id)" icon="pi pi-eye" variant="neutral" size="small" v-tooltip="'View'" />
            <ThemedButton @click="editSchedule(data.id)" icon="pi pi-pencil" variant="primary" size="small" v-tooltip="'Edit'" />
            <ThemedButton @click="deleteSchedule(data.id)" icon="pi pi-trash" variant="danger" size="small" v-tooltip="'Delete'" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useThemeStore } from '@/stores/theme.store'
import { useTeamColors } from '@/composables/useTeamColors'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ThemedButton from '@/components/ThemedButton.vue'
import TeamAwareTag from '@/components/TeamAwareTag.vue'
import GameResultTag from '@/components/GameResultTag.vue'

const scheduleStore = useScheduleStore()
const themeStore = useThemeStore()
const router = useRouter()
const { currentTeam } = useTeamColors()

const rows = ref(10)
const first = ref(0)
const { teams } = storeToRefs(themeStore)

onMounted(async () => {
  await scheduleStore.fetchAll(1, rows.value)
  if (teams.value.length === 0) await themeStore.initializeTheme()
})

const onPage = async (event: any) => {
  const page = event.page + 1
  const limit = event.rows
  first.value = event.first
  rows.value = limit
  await scheduleStore.fetchAll(page, limit)
}

const viewSchedule = (id: number) => router.push(`/schedules/${id}?mode=read`)
const editSchedule = (id: number) => router.push(`/schedules/${id}?mode=edit`)
const createSchedule = () => router.push('/schedules?mode=create')

const deleteSchedule = async (id: number) => {
  if (!confirm('Are you sure you want to delete this schedule?')) return
  await scheduleStore.remove(id)
  const page = Math.floor(first.value / rows.value) + 1
  await scheduleStore.fetchAll(page, rows.value, true)
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'TBD'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---- Name/color helpers using theme cache ----
const findTeam = (idOrAbbr: number | string | undefined) => {
  if (idOrAbbr == null) return undefined
  const idStr = String(idOrAbbr)
  return teams.value.find(t => String(t.id) === idStr || (t.abbreviation && t.abbreviation.toUpperCase() === idStr.toUpperCase()))
}

const getTeamName = (idOrAbbr: number | string | undefined): string => {
  const t = findTeam(idOrAbbr)
  return t ? t.name : (idOrAbbr != null ? String(idOrAbbr) : 'TBD')
}

const getOpponentColors = (idOrAbbr: number | string | undefined): string[] | null => {
  const t = findTeam(idOrAbbr)
  return t ? [t.colors.primary, t.colors.secondary] : null
}

const isWinningScore = (score1: number | undefined, score2: number | undefined) => {
  if (score1 == null || score2 == null) return false
  return score1 > score2
}
</script>

<style scoped>
.schedule-list { @apply w-full; }
.list-header { @apply flex justify-between items-center; }
.action-buttons { @apply flex gap-2; }
.week-badge { @apply inline-block; }
.opponent-info { @apply flex flex-col; }
.opponent-colors { @apply flex gap-1; }
.color-dot { @apply w-3 h-3 rounded-full border border-gray-300; }
.score-display { @apply px-2 py-1 rounded text-sm font-bold text-center; background-color: var(--color-neutral-100); color: var(--color-neutral-700); }
.score-display.winning-score { background-color: var(--team-secondary); color: var(--team-accent); }
.score-display.team-score.winning-score { background-color: var(--team-primary); }
.themed-datatable { @apply shadow-lg rounded-lg overflow-hidden; }
.matchup { @apply flex items-center gap-1; }
.team { @apply font-semibold; }
</style>

// theme


// stores/theme.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Team, TeamId } from '@/types/team.types';
import { TeamRepository } from '@/infrastructure/repositories/team.repository';
import { ThemeService } from '@/application/services/theme.service';

export const useThemeStore = defineStore('theme', () => {
  // State
  const teams = ref<Team[]>([]);
  const currentTeam = ref<Team | null>(null);
  const isLoading = ref(false);

  // Lazy initialization of dependencies
  let teamRepository: TeamRepository | null = null;
  let themeService: ThemeService | null = null;

  const getTeamRepository = (): TeamRepository => {
    if (!teamRepository) {
      teamRepository = new TeamRepository();
    }
    return teamRepository;
  };

  const getThemeService = (): ThemeService => {
    if (!themeService) {
      themeService = new ThemeService(getTeamRepository());
    }
    return themeService;
  };

  // Getters
  const teamsByConference = computed(() => {
    const afc = teams.value.filter(team => team.conference === 'AFC');
    const nfc = teams.value.filter(team => team.conference === 'NFC');
    return { afc, nfc };
  });

  const teamsByDivision = computed(() => {
    return teams.value.reduce((acc, team) => {
      if (!acc[team.division]) {
        acc[team.division] = [];
      }
      acc[team.division].push(team);
      return acc;
    }, {} as Record<string, Team[]>);
  });

  // Actions
  const loadTeams = async (): Promise<void> => {
    isLoading.value = true;
    try {
      teams.value = await getTeamRepository().getAll();
    } catch (error) {
      console.error('Failed to load teams:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const selectTeam = async (teamId: TeamId): Promise<void> => {
    try {
      await getThemeService().applyTeamColors(teamId);
      currentTeam.value = getThemeService().getCurrentTeam();
    } catch (error) {
      console.error('Failed to select team:', error);
      throw error;
    }
  };

  const resetTheme = (): void => {
    getThemeService().resetToDefault();
    currentTeam.value = null;
  };

  const initializeTheme = async (): Promise<void> => {
    await loadTeams();
    await getThemeService().loadSavedTeam();
    currentTeam.value = getThemeService().getCurrentTeam();
  };

  return {
    // State
    teams,
    currentTeam,
    isLoading,
    
    // Getters
    teamsByConference,
    teamsByDivision,
    
    // Actions
    loadTeams,
    selectTeam,
    resetTheme,
    initializeTheme,
  };
});

// scheduleStore.ts
// src/stores/scheduleStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { scheduleService } from '@/services/scheduleService'
import type { Schedule, CrudMode, PaginationMeta } from '@/types'

// ---- tolerant pagination helpers ----
type MinimalMeta = {
  total?: number
  page?: number
  limit?: number
  pages?: number
} | null | undefined

function toPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)))
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * If the backend doesn't send meta, infer a useful total:
 * - If we got fewer than `limit` rows, total = (page-1)*limit + dataLen  (last page)
 * - If we got exactly `limit` rows, total = page*limit + 1  (force at least one more page)
 */
function coercePagination(
  meta: PaginationMeta | MinimalMeta,
  dataLen: number,
  page: number,
  limit: number
): PaginationMeta {
  // Full meta provided
  if (meta && typeof meta === 'object' && 'totalPages' in meta) {
    const m = meta as PaginationMeta
    const effLimit = m.limit ?? limit
    const effPage  = m.page  ?? page
    const effTotal = m.total ?? (dataLen < effLimit ? (effPage - 1) * effLimit + dataLen : effPage * effLimit + 1)
    const effTotalPages = m.totalPages ?? Math.max(1, Math.ceil(effTotal / effLimit))
    return {
      total: effTotal,
      page: effPage,
      limit: effLimit,
      totalPages: effTotalPages,
      hasNext: m.hasNext ?? (effPage < effTotalPages),
      hasPrev: m.hasPrev ?? (effPage > 1),
    }
  }

  // Minimal / no meta: infer a total that enables paginator
  const effLimit = limit
  const effPage  = page
  const effTotal = dataLen < limit
    ? (effPage - 1) * effLimit + dataLen
    : effPage * effLimit + 1

  return toPaginationMeta(effTotal, effPage, effLimit)
}

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref<Schedule[]>([])
  const currentSchedule = ref<Schedule | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const mode = ref<CrudMode>('read')

  const pagination = ref<PaginationMeta | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const getScheduleById = computed(() => (id: number) => schedules.value.find(s => s.id === id))
  const getSchedulesByTeam = computed(() => (teamId: number) => schedules.value.filter(s => s.teamId === teamId))
  const getSchedulesBySeason = computed(() => (seasonYear: number) => schedules.value.filter(s => Number(s.seasonYear) === seasonYear))

  const setResult = (
    payload: { data: Schedule[]; pagination?: PaginationMeta | MinimalMeta },
    page: number,
    limit: number,
    refresh: boolean
  ) => {
    if (page === 1 || refresh) {
      schedules.value = payload.data
    } else {
      schedules.value = [...schedules.value, ...payload.data]
    }

    pagination.value = coercePagination(payload.pagination, payload.data.length, page, limit)
    currentPage.value = page
    itemsPerPage.value = limit
  }

  const fetchAll = async (page = 1, limit = 10, refresh = false) => {
    if (schedules.value.length > 0 && !refresh && currentPage.value === page) return
    loading.value = true; error.value = null
    try {
      const res = await scheduleService.getAll(page, limit)
      setResult(res, page, limit, page === 1 || refresh)
    } catch (e) {
      error.value = 'Failed to fetch schedules from server'; throw e
    } finally { loading.value = false }
  }

  const fetchByTeam = async (teamId: number, page = 1, limit = 10) => {
    loading.value = true; error.value = null
    try {
      const res = await scheduleService.getByTeam(teamId, page, limit)
      setResult(res, page, limit, page === 1)
      return res.data
    } catch (e) {
      error.value = 'Failed to fetch team schedules from server'; throw e
    } finally { loading.value = false }
  }

  const fetchBySeason = async (seasonYear: number, page = 1, limit = 10) => {
    loading.value = true; error.value = null
    try {
      const res = await scheduleService.getBySeason(seasonYear, page, limit)
      setResult(res, page, limit, page === 1)
      return res.data
    } catch (e) {
      error.value = 'Failed to fetch season schedules from server'; throw e
    } finally { loading.value = false }
  }

  const fetchByTeamSeason = async (teamId: number, seasonYear: number, page = 1, limit = 10) => {
    loading.value = true; error.value = null
    try {
      const res = await scheduleService.getByTeamSeason(teamId, seasonYear, page, limit)
      setResult(res, page, limit, page === 1)
      return res.data
    } catch (e) {
      error.value = 'Failed to fetch team+season schedules from server'; throw e
    } finally { loading.value = false }
  }

  const fetchById = async (id: number, useCache = true) => {
    if (useCache) {
      const cached = getScheduleById.value(id)
      if (cached) { currentSchedule.value = cached; return cached }
    }
    loading.value = true; error.value = null
    try {
      const s = await scheduleService.getById(id)
      currentSchedule.value = s
      const idx = schedules.value.findIndex(it => it.id === id)
      if (idx !== -1) schedules.value[idx] = s; else schedules.value.push(s)
      return s
    } catch (e) {
      error.value = 'Failed to fetch schedule from server'; throw e
    } finally { loading.value = false }
  }

  const create = async (payload: Omit<Schedule, 'id'>) => {
    loading.value = true; error.value = null
    try {
      const s = await scheduleService.create(payload)
      schedules.value.push(s); currentSchedule.value = s; return s
    } catch (e) {
      error.value = 'Failed to create schedule on server'; throw e
    } finally { loading.value = false }
  }

  const update = async (id: number, patch: Partial<Schedule>) => {
    loading.value = true; error.value = null
    try {
      const s = await scheduleService.update(id, patch)
      const idx = schedules.value.findIndex(it => it.id === id)
      if (idx !== -1) schedules.value[idx] = s
      currentSchedule.value = s; return s
    } catch (e) {
      error.value = 'Failed to update schedule on server'; throw e
    } finally { loading.value = false }
  }

  const remove = async (id: number) => {
    loading.value = true; error.value = null
    try {
      await scheduleService.delete(id)
      schedules.value = schedules.value.filter(it => it.id !== id)
      if (currentSchedule.value?.id === id) currentSchedule.value = null
    } catch (e) {
      error.value = 'Failed to delete schedule on server'; throw e
    } finally { loading.value = false }
  }

  const setMode = (m: CrudMode) => { mode.value = m }
  const clearCurrent = () => { currentSchedule.value = null }
  const clearError = () => { error.value = null }
  const refreshData = (page = currentPage.value, limit = itemsPerPage.value) => fetchAll(page, limit, true)

  return {
    schedules, currentSchedule, loading, error, mode,
    pagination, currentPage, itemsPerPage,
    getScheduleById, getSchedulesByTeam, getSchedulesBySeason,
    fetchAll, fetchById, fetchByTeam, fetchBySeason, fetchByTeamSeason,
    create, update, remove, setMode, clearCurrent, clearError, refreshData,
  }
})

// scheduleService.ts
import { apiService } from './api'
import type { Schedule, ApiResponse, PaginatedResponse } from '@/types'

export class ScheduleService {
  private readonly endpoint = '/schedules'

  // paginated-queries: Fix for double nesting on server
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Schedule>> {
    const pageNum = Number(page)
    const limitNum = Number(limit)
    
    // Build URL manually to avoid axios params encoding issues
    const url = `${this.endpoint}?page=${pageNum}&limit=${limitNum}`
  
    try {
      const response = await apiService.get<ApiResponse<Schedule[], any>>(url)
      
      // Check if backend respected our parameters
      const backendPage = response.data.pagination?.page
      const backendLimit = response.data.pagination?.limit
      console.log(`🔍 Parameter check: requested page=${pageNum}, got page=${backendPage}`)
      console.log(`🔍 Parameter check: requested limit=${limitNum}, got limit=${backendLimit}`)
      
      if (backendPage !== pageNum) {
        console.warn(`⚠️ Backend page mismatch! Requested: ${pageNum}, Got: ${backendPage}`)
      }
      if (backendLimit !== limitNum) {
        console.warn(`⚠️ Backend limit mismatch! Requested: ${limitNum}, Got: ${backendLimit}`)
      }
      
      const result = {
        data: response.data.data,
        pagination: response.data.pagination
      }
      
      return result
      
    } catch (error) {
      console.error('❌ API call failed:', error)
      throw error
    }
  }

  // non-paginated queries: fix for double nesting from server
  async getById(id: number): Promise<Schedule> {
    const response = await apiService.get<ApiResponse<Schedule>>(
      `${this.endpoint}/${id}`
    )
    return response.data.data
  }

  // ✅ Replace old "no such route" call with filtered index route
  async getByTeam(teamId: number, page = 1, limit = 10): Promise<PaginatedResponse<Schedule>> {
    const url = `${this.endpoint}?teamId=${Number(teamId)}&page=${Number(page)}&limit=${Number(limit)}`
    const { data } = await apiService.get<{ success: boolean; data: Schedule[]; pagination: any }>(url)
    return { data: data.data, pagination: data.pagination }
  }

  // ✅ Replace old "no such route" call with filtered index route
  async getBySeason(seasonYear: number, page = 1, limit = 10): Promise<PaginatedResponse<Schedule>> {
    const url = `${this.endpoint}?seasonYear=${Number(seasonYear)}&page=${Number(page)}&limit=${Number(limit)}`
    const { data } = await apiService.get<{ success: boolean; data: Schedule[]; pagination: any }>(url)
    return { data: data.data, pagination: data.pagination }
  }

  // ✅ Add explicit team+season method to use the existing param route
  async getByTeamSeason(teamId: number, seasonYear: number, page = 1, limit = 10): Promise<PaginatedResponse<Schedule>> {
    // Option 1: use the param route (no pagination on that path today)
    // const { data } = await apiService.get<ApiResponse<Schedule[]>>(`${this.endpoint}/team/${teamId}/season/${seasonYear}`)
    // return { data: data.data, pagination: { page, limit, total: data.data.length } }

    // Option 2 (prefer): keep one code path via filtered index route, with pagination
    const url = `${this.endpoint}?teamId=${Number(teamId)}&seasonYear=${Number(seasonYear)}&page=${Number(page)}&limit=${Number(limit)}`
    const { data } = await apiService.get<{ success: boolean; data: Schedule[]; pagination: any }>(url)
    return { data: data.data, pagination: data.pagination }
  }
  // '/team/:teamId/season/:seasonYear'
  async getByTeamSeason(teamId: number, seasonYear: number): Promise<Schedule[]> {
    const response = await apiService.get<ApiResponse<Schedule[]>>(
      `${this.endpoint}/teamId/${teamId}/season/${seasonYear}`
    )
    return response.data.data
  }

  async create(data: Omit<Schedule, 'id'>): Promise<Schedule> {
    const response = await apiService.post<ApiResponse<Schedule>>(this.endpoint, data)
    return response.data.data
  }

  async update(id: number, data: Partial<Schedule>): Promise<Schedule> {
    const response = await apiService.put<ApiResponse<Schedule>>(`${this.endpoint}/${id}`, data)
    return response.data.data
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.endpoint}/${id}`)
  }
}

export const scheduleService = new ScheduleService()
