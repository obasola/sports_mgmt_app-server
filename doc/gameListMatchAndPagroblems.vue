gameList missing matchup team names, but pagination bar showing.
Also gameList showing Unknown not team name. DevTools Network response confirms we have home/away teamIds.

/*********************************************************************
/*
/* gameList.ts
/*
/*********************************************************************
<!-- sports_mgmt_app_client/src/components/game/gameList.vue -->

<!-- src/components/game/GameList.vue -->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { FilterMatchMode } from 'primevue/api'
import GameCreateForm from '@/components/game/GameCreateForm.vue'
import GameEditForm from '@/components/game/GameEditForm.vue'

const gameStore = useGameStore()
const router = useRouter()

// sensible default: regular season year in view
const seasonYear = ref<number>(new Date().getFullYear())

// Server pagination state (PrimeVue uses 0-based paging; server is 1-based)
const rows = ref(10)
const first = ref(0)

// Modal
const showCreateModal = ref(false)

// Filters (PrimeVue UI filters; server still governs the data size)
const filters = ref({
  seasonYear: { value: null, matchMode: FilterMatchMode.CONTAINS },
  'homeTeam.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  gameLocation: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

onMounted(async () => {
  await gameStore.fetchAll(1, rows.value, { year: seasonYear.value }) // first load
})

// When the year changes, reload page 1
watch(seasonYear, async (y) => {
  first.value = 0
  await gameStore.fetchAll(1, rows.value, { year: y })
})

// PrimeVue page event (server-side)
const onPage = async (event: any) => {
  const page = event.page + 1
  const limit = event.rows
  first.value = event.first
  rows.value = limit
  await gameStore.fetchAll(page, limit, { year: seasonYear.value })
}

const viewGame = (id: number) => router.push(`/games/${id}?mode=read`)
const editGame = (id: number) => router.push(`/games/${id}?mode=edit`)
const createGame = () => { showCreateModal.value = true }

const deleteGame = async (id: number) => {
  if (!confirm('Are you sure you want to delete this game?')) return
  await gameStore.remove(id)
  // reload current page
  const page = Math.floor(first.value / rows.value) + 1
  await gameStore.fetchAll(page, rows.value, { year: seasonYear.value }, true)
}

const onGameCreated = async () => {
  showCreateModal.value = false
  // reload current page
  const page = Math.floor(first.value / rows.value) + 1
  await gameStore.fetchAll(page, rows.value, { year: seasonYear.value }, true)
}

// Helpers
const getTeamShortNameAndLogo = (team: any): { shortName: string; logoPath: string } => {
  if (!team || !team.name || !team.conference) return { shortName: 'Unknown', logoPath: '' }
  const nameParts = team.name.trim().split(' ')
  const shortName = nameParts[nameParts.length - 1]
  const fileExt = shortName === 'Chargers' ? 'webp' : 'avif'
  const logoFile = `${shortName}.${fileExt}`
  return { shortName, logoPath: `/images/${team.conference.toLowerCase()}/${logoFile}` }
}
</script>

<template>
  <div class="team-list">
    <div class="list-header bg-team-primary text-team-accent">
      <div class="flex items-center gap-3">
        <label class="font-semibold">Season</label>
        <input
          v-model.number="seasonYear"
          type="number"
          class="p-inputtext p-component w-28"
          min="2000"
          max="2100"
        />
      </div>
      <Button @click="createGame" label="Create Game" icon="pi pi-plus" class="p-button-success" />
    </div>

    <DataTable
      :value="gameStore.games"
      :loading="gameStore.loading"
      dataKey="id"
      :lazy="true"
      paginator
      :rows="rows"
      :first="first"
      :totalRecords="gameStore.pagination?.total || 0"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      @page="onPage"
      responsiveLayout="scroll"
      sortMode="single"
      :globalFilterFields="['seasonYear', 'homeTeam.name', 'awayTeam.name', 'gameLocation']"
      filterDisplay="menu"
      :filters="filters"
      showGridlines
      class="themed-datatable"
    >
      <Column field="seasonYear" header="Season" sortable />
      <Column header="Week" sortable sortField="gameWeek">
        <template #body="{ data }">
          <span v-if="data.preseason">Pre {{ data.preseason }}</span>
          <span v-else-if="data.gameWeek">Week {{ data.gameWeek }}</span>
          <span v-else>-</span>
        </template>
      </Column>
      <Column field="gameDate" header="Date" sortable dataType="date">
        <template #body="{ data }">
          <span v-if="data.gameDate">{{ new Date(data.gameDate).toLocaleDateString() }}</span>
          <span v-else>TBD</span>
        </template>
      </Column>
      <Column header="Matchup" sortField="homeTeam.name">
        <template #body="{ data }">
          <div class="matchup-cell">
            <div class="team">
              <img
                v-if="data.awayTeam"
                :src="getTeamShortNameAndLogo(data.awayTeamId).logoPath"
                :alt="getTeamShortNameAndLogo(data.awayTeamId).shortName"
                class="team-logo"
              />
              <span>{{ getTeamShortNameAndLogo(data.awayTeamId).shortName }}</span>
            </div>
            <span class="at-symbol">@</span>
            <div class="team">
              <img
                v-if="data.homeTeam"
                :src="getTeamShortNameAndLogo(data.homeTeamId).logoPath"
                :alt="getTeamShortNameAndLogo(data.homeTeamId).shortName"
                class="team-logo"
              />
              <span>{{ getTeamShortNameAndLogo(data.homeTeamId).shortName }}</span>
            </div>
          </div>
        </template>
      </Column>
      <Column header="Score" sortField="homeScore">
        <template #body="{ data }">
          <span v-if="data.homeScore != null && data.awayScore != null">
            {{ data.awayScore }} - {{ data.homeScore }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>
      </Column>
      <Column field="gameLocation" header="Location" sortable>
        <template #body="{ data }">
          <span v-if="data.gameLocation">{{ data.gameLocation }}</span>
          <span v-else-if="data.gameCity && data.gameStateProvince">{{ data.gameCity }}, {{ data.gameStateProvince }}</span>
          <span v-else-if="data.gameCity">{{ data.gameCity }}</span>
          <span v-else-if="data.homeTeam && data.homeTeam.city">{{ data.homeTeam.city }}</span>
          <span v-else class="text-muted">TBD</span>
        </template>
      </Column>
      <Column field="gameStatus" header="Status" sortable>
        <template #body="{ data }">
          <span>{{ data.gameStatus || 'SCHEDULED' }}</span>
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button @click="viewGame(data.id)" icon="pi pi-eye" class="p-button-info p-button-sm" v-tooltip="'View'" />
            <Button @click="editGame(data.id)" icon="pi pi-pencil" class="p-button-warning p-button-sm" v-tooltip="'Edit'" />
            <Button @click="deleteGame(data.id)" icon="pi pi-trash" class="p-button-danger p-button-sm" v-tooltip="'Delete'" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="showCreateModal"
      modal
      header="Create New Game"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <GameCreateForm
        @game-created="onGameCreated"
        @cancel="() => (showCreateModal = false)"
      />
    </Dialog>
  </div>
</template>

<style scoped>
.team-list { width: 100%; }
.list-header { display:flex; justify-content: space-between; align-items:center; margin-bottom:1rem; padding:1rem; border-radius:8px; }

.action-buttons { display:flex; gap:0.5rem; }
.text-muted { color:#6c757d; font-style:italic; }

.matchup-cell { display:flex; align-items:center; gap:0.25rem; }
.team { display:flex; align-items:center; gap:0.25rem; }
.team-logo { width:40px; height:40px; object-fit:contain; vertical-align:middle; }
.at-symbol { font-weight:bold; margin:0 0.25rem; }

/* keep your themed look */
.themed-datatable { }
</style>

/*********************************************************************
/*
/* stores/theme.ts
/*
/*********************************************************************
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

// gameStore.ts
// src/stores/gameStore.ts

// src/stores/gameStore.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import { gameService } from '@/services/gameService'
import type { Game, CrudMode, PaginationMeta } from '@/types'

export interface GameRow {
  id: number
  seasonYear: string
  gameWeek: number | null
  preseason: number | null
  gameDate: string
  homeTeamId: number
  awayTeamId: number
  homeTeam?: {
    id: number
    name: string
    conference?: string | null
    division?: string | null
    city?: string | null
    state?: string | null
    stadium?: string | null
  }
  awayTeam?: {
    id: number
    name: string
    conference?: string | null
    division?: string | null
    city?: string | null
    state?: string | null
    stadium?: string | null
  }
  gameLocation?: string | null
  gameCity?: string | null
  gameStateProvince?: string | null
  gameCountry?: string | null
  homeScore?: number | null
  awayScore?: number | null
  gameStatus: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: false,
})

export const useGameStore = defineStore('games', {
  state: () => ({
    games: [] as GameRow[],
    currentGame: null as GameRow | null,
    loading: false,
    error: null as string | null,
    mode: 'read' as CrudMode,

    pagination: null as PaginationMeta | null,
    currentPage: 1,
    itemsPerPage: 10,
  }),

  actions: {
    async getGameById(id: number) {
      return this.fetchById(id)
    },

    async fetchById(id: number) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get<GameRow | { data: GameRow }>(`/games/${id}`)
        const payload =
          data && typeof data === 'object' && 'data' in data ? (data as any).data : data
        this.currentGame = payload as GameRow
        const i = this.games.findIndex(g => g.id === (payload as GameRow).id)
        if (i >= 0) this.games[i] = payload as GameRow
        else this.games.push(payload as GameRow)
        return payload
      } catch (err) {
        this.error = 'Failed to load game by id'
        throw err
      } finally {
        this.loading = false
      }
    },

    // Generic server-paginated fetch
    async fetchAll(
      page = 1,
      limit = 10,
      extraParams: Record<string, unknown> = {},
      refresh = false
    ) {
      this.loading = true
      this.error = null
      try {
        const { data, headers } = await api.get('/games', {
          params: { page, limit, ...extraParams },
        })

        const rows = normalizeToRows(data)
        this.games = rows

        // read total from payload.pagination.total, or X-Total-Count, or fallback to rows length
        const total =
          (data?.pagination?.total as number) ??
          (parseInt(headers['x-total-count'] || '0', 10) || rows.length)

        this.pagination = toPaginationMeta(total, page, limit)
        this.currentPage = page
        this.itemsPerPage = limit

        return { data: rows, pagination: this.pagination }
      } catch (err) {
        this.error = 'Failed to load games'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchByYear(year: string | number, page = 1, limit = 10) {
      return this.fetchAll(page, limit, { year })
    },

    async fetchLeagueWeek(year: string | number, week: number, page = 1, limit = 10) {
      return this.fetchAll(page, limit, { year, week })
    },

    async fetchLeaguePreseason(year: string | number, page = 1, limit = 10) {
      return this.fetchAll(page, limit, { year, preseason: 1 })
    },

    async fetchTeamSeason(teamId: number, year: string | number, page = 1, limit = 10) {
      return this.fetchAll(page, limit, { teamId, year })
    },

    async fetchTeamSeasonWeekGames(
      teamId: number,
      year: string | number,
      week: number,
      page = 1,
      limit = 10
    ) {
      return this.fetchAll(page, limit, { teamId, year, week })
    },

    async fetchTeamPreseason(teamId: number, year: string | number, page = 1, limit = 10) {
      return this.fetchAll(page, limit, { teamId, year, preseason: 1 })
    },

    async create(data: Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const newGame = await gameService.create(data)
        const row: GameRow = normalizeToRow(newGame)
        this.games.unshift(row)
        this.currentGame = row
        return row
      } catch (err) {
        this.error = 'Failed to create game on server'
        throw err
      } finally {
        this.loading = false
      }
    },

    async update(
      id: number,
      data: Partial<Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>>
    ) {
      this.loading = true
      this.error = null
      try {
        const updated = await gameService.update(id, data)
        const updatedRow = normalizeToRow(updated)
        const idx = this.games.findIndex(g => g.id === id)
        if (idx !== -1) this.games[idx] = updatedRow
        this.currentGame = updatedRow
        return updatedRow
      } catch (err) {
        this.error = 'Failed to update game on server'
        throw err
      } finally {
        this.loading = false
      }
    },

    async remove(id: number) {
      this.loading = true
      this.error = null
      try {
        await gameService.delete(id)
        this.games = this.games.filter(g => g.id !== id)
        if (this.currentGame?.id === id) this.currentGame = null
      } catch (err) {
        this.error = 'Failed to delete game on server'
        throw err
      } finally {
        this.loading = false
      }
    },

    setMode(newMode: CrudMode) {
      this.mode = newMode
    },
    clearCurrent() {
      this.currentGame = null
    },
    clearError() {
      this.error = null
    },
    refreshData() {
      return this.fetchAll(this.currentPage, this.itemsPerPage)
    },
  },
})

// ---------- helpers ----------
// --- add this helper near the bottom of the file (before export or with other helpers) ---
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

function normalizeToRow(g: Game): GameRow {
  return {
    id: g.id,
    seasonYear: String(g.seasonYear),
    gameWeek: g.gameWeek ?? null,
    preseason: (g as any).preseason ?? null,
    gameDate: g.gameDate as unknown as string,
    homeTeamId: g.homeTeamId,
    awayTeamId: g.awayTeamId,
    homeTeam: g.homeTeam as any,
    awayTeam: g.awayTeam as any,
    gameLocation: (g as any).gameLocation ?? null,
    gameCity: (g as any).gameCity ?? null,
    gameStateProvince: (g as any).gameStateProvince ?? null,
    gameCountry: (g as any).gameCountry ?? null,
    homeScore: (g as any).homeScore ?? null,
    awayScore: (g as any).awayScore ?? null,
    gameStatus: (g as any).gameStatus ?? 'scheduled',
  }
}

function normalizeToRows(payload: unknown): GameRow[] {
  if (Array.isArray(payload)) return payload as GameRow[]
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as GameRow[]
    if (Array.isArray(obj.items)) return obj.items as GameRow[]
    if (Array.isArray(obj.results)) return obj.results as GameRow[]
  }
  return []
}


/*********************************************************************
/*
/* gameService.ts
/*
/*********************************************************************
// src/services/gameService.ts
import { apiService } from './api'
import type { Game, ApiResponse, PaginatedResponse } from '@/types'

export class GameService {
  private readonly endpoint = '/games'
  private paginationSupported: boolean | null = null // Cache pagination support detection

  // CRITICAL: Enhanced pagination with fallback for unsupported endpoints
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Game>> {
    const pageNum = Number(page)
    const limitNum = Number(limit)

    // First, try paginated request
    if (this.paginationSupported !== false) {
      try {
        return await this.getPaginated(pageNum, limitNum)
      } catch (error: any) {
        // Check if this is a 400 error indicating unsupported pagination
        if (error.response?.status === 400) {
          console.warn('⚠️ Games API does not support pagination, falling back to full fetch')
          this.paginationSupported = false
          return await this.getFallback(pageNum, limitNum)
        }
        throw error
      }
    } else {
      // We know pagination isn't supported, use fallback
      return await this.getFallback(pageNum, limitNum)
    }
  }

  private async getPaginated(page: number, limit: number): Promise<PaginatedResponse<Game>> {
    // Use manual URL building like other working endpoints
    const url = `${this.endpoint}?page=${page}&limit=${limit}&include=homeTeam,awayTeam`
    console.log(`🔍 Game Service: Making paginated request to ${url}`)

    try {
      const response = await apiService.get<ApiResponse<Game[], any>>(url)

      // Mark pagination as supported
      this.paginationSupported = true

      // Check if backend respected our parameters
      const backendPage = response.data.pagination?.page
      const backendLimit = response.data.pagination?.limit
      console.log(`🔍 Parameter check: requested page=${page}, got page=${backendPage}`)
      console.log(`🔍 Parameter check: requested limit=${limit}, got limit=${backendLimit}`)

      if (backendPage !== page) {
        console.warn(`⚠️ Backend page mismatch! Requested: ${page}, Got: ${backendPage}`)
      }
      if (backendLimit !== limit) {
        console.warn(`⚠️ Backend limit mismatch! Requested: ${limit}, Got: ${backendLimit}`)
      }

      // Handle response structure
      let gameData: Game[]
      let paginationData: any

      if (response.data.data && Array.isArray(response.data.data)) {
        gameData = response.data.data
        paginationData = response.data.pagination
      } else if (Array.isArray(response.data)) {
        gameData = response.data as Game[]
        paginationData = null
      } else {
        console.error('❌ Unexpected paginated response structure:', response.data)
        throw new Error('Invalid response structure from games pagination API')
      }

      // Check if team relationships are populated
      if (gameData.length > 0) {
        const firstGame = gameData[0]
        console.log('🔍 Game Service: Team relationship check:', {
          homeTeam: firstGame.homeTeam ? 'populated' : 'missing',
          awayTeam: firstGame.awayTeam ? 'populated' : 'missing',
          homeTeamId: firstGame.homeTeamId,
          awayTeamId: firstGame.awayTeamId,
        })
      }

      const result = {
        data: gameData,
        pagination: paginationData,
      }

      console.log(`✅ Game Service: Paginated result processed:`, result)
      return result
    } catch (error: any) {
      console.error('❌ Game paginated API call failed:', error)
      if (error.response) {
        console.error('❌ Response status:', error.response.status)
        console.error('❌ Response data:', error.response.data)

        // Provide specific guidance for the coerce issue
        if (
          error.response.status === 400 &&
          error.response.data?.message?.includes('Expected number, received string')
        ) {
          console.error(
            '🔧 BACKEND FIX NEEDED: Games endpoint validation schema needs z.coerce.number().optional() for page and limit parameters'
          )
        }
      }
      throw error
    }
  }

  private async getFallback(page: number, limit: number): Promise<PaginatedResponse<Game>> {
    console.log(`🔍 Game Service: Using fallback non-paginated request`)

    // Try different approaches to get team relationships
    const endpoints = [
      `${this.endpoint}?include=homeTeam,awayTeam`, // Common approach
      `${this.endpoint}?populate=homeTeam,awayTeam`, // Mongoose/Sequelize approach
      `${this.endpoint}?with=homeTeam,awayTeam`, // Laravel approach
      `${this.endpoint}?expand=homeTeam,awayTeam`, // Some REST APIs
      this.endpoint, // Plain endpoint as final fallback
    ]

    for (const [index, endpoint] of endpoints.entries()) {
      try {
        console.log(`🔍 Game Service: Trying fallback approach ${index + 1}: ${endpoint}`)
        const response = await apiService.get<ApiResponse<Game[]> | Game[]>(endpoint)

        console.log('🔍 Game Service: Fallback response received:', response.data)

        // Handle response structure
        let allGames: Game[]

        if (
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data &&
          Array.isArray(response.data.data)
        ) {
          // Wrapped ApiResponse format
          allGames = response.data.data
        } else if (Array.isArray(response.data)) {
          // Direct array format
          allGames = response.data as Game[]
        } else {
          console.error('❌ Unexpected fallback response structure:', response.data)
          throw new Error('Invalid response structure from games API')
        }

        // Check if this approach gave us team relationships
        if (allGames.length > 0) {
          const firstGame = allGames[0]
          const hasTeamData = firstGame.homeTeam && firstGame.awayTeam
          console.log(`🔍 Game Service: Fallback approach ${index + 1} team relationship check:`, {
            hasTeamData,
            homeTeam: firstGame.homeTeam ? 'populated' : 'missing',
            awayTeam: firstGame.awayTeam ? 'populated' : 'missing',
          })

          if (hasTeamData) {
            console.log(`✅ Game Service: Found working fallback approach with team relationships`)
          }
        }

        // Implement client-side pagination
        const total = allGames.length
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedData = allGames.slice(startIndex, endIndex)

        const result = {
          data: paginatedData,
          pagination: {
            page: page,
            limit: limit,
            total: total,
            pages: Math.ceil(total / limit),
          },
        }

        console.log(`✅ Game Service: Fallback result processed:`, {
          approach: index + 1,
          endpoint: endpoint,
          total: total,
          page: page,
          limit: limit,
          returned: paginatedData.length,
          hasTeamRelationships:
            paginatedData.length > 0 && paginatedData[0].homeTeam ? true : false,
        })

        return result
      } catch (error: any) {
        console.warn(`⚠️ Game Service: Fallback approach ${index + 1} failed:`, error.message)
        if (index === endpoints.length - 1) {
          // This was the last attempt, throw the error
          console.error('❌ Game fallback: All approaches failed')
          if (error.response) {
            console.error('❌ Response status:', error.response.status)
            console.error('❌ Response data:', error.response.data)
          }
          throw error
        }
        // Continue to next approach
      }
    }

    // This shouldn't be reached due to the logic above, but TypeScript requires it
    throw new Error('All fallback approaches failed')
  }

  // non-paginated queries: fix for double nesting from server
  async getById(id: number): Promise<Game> {
    console.log(`🔍 Game Service: Fetching game by ID: ${id}`)

    // Try different approaches to get team relationships using axios params
    const approaches = [
      { include: 'homeTeam,awayTeam' },
      { populate: 'homeTeam,awayTeam' },
      { with: 'homeTeam,awayTeam' },
      { expand: 'homeTeam,awayTeam' },
      {}, // Plain request as fallback
    ]

    for (const [index, params] of approaches.entries()) {
      try {
        console.log(`🔍 Game Service: Trying getById approach ${index + 1} with params:`, params)
        const response = await apiService.get<ApiResponse<Game> | Game>(`${this.endpoint}/${id}`, {
          params: params,
        })
        console.log('🔍 Game Service: getById response:', response.data)

        // Handle both wrapped and direct responses
        let game: Game

        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          // Wrapped ApiResponse format
          const wrappedResponse = response.data as ApiResponse<Game>
          game = wrappedResponse.data
        } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
          // Direct game object format
          game = response.data as Game
        } else {
          console.error('❌ Unexpected getById response structure:', response.data)
          throw new Error('Invalid response structure from game API')
        }

        // Check if this approach gave us team relationships
        const hasTeamData = game.homeTeam && game.awayTeam
        console.log(`🔍 Game Service: getById approach ${index + 1} team relationship check:`, {
          hasTeamData,
          homeTeam: game.homeTeam ? 'populated' : 'missing',
          awayTeam: game.awayTeam ? 'populated' : 'missing',
        })

        if (hasTeamData) {
          console.log(`✅ Game Service: getById found working approach with team relationships`)
        }

        return game
      } catch (error: any) {
        console.warn(`⚠️ Game Service: getById approach ${index + 1} failed:`, error.message)
        if (index === approaches.length - 1) {
          // This was the last attempt, throw the error
          console.error(`❌ Failed to fetch game ${id} with all approaches`)
          throw error
        }
        // Continue to next approach
      }
    }

    // This shouldn't be reached due to the logic above, but TypeScript requires it
    throw new Error(`All getById approaches failed for game ${id}`)
  }

  async getBySeasonYear(seasonYear: string): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by season: ${seasonYear}`)
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            seasonYear: seasonYear,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(`❌ Failed to fetch games by season ${seasonYear}:`, error)
      throw error
    }
  }

  async getByTeam(teamId: number): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by team: ${teamId}`)
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            teamId: teamId,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(`❌ Failed to fetch games by team ${teamId}:`, error)
      throw error
    }
  }

  async getByTeamAndSeasonYear(teamId: number, seasonYear: string): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by season: ${seasonYear}`)
    const res = await apiService.get<ApiResponse<Game[]> | Game[]>(
      `/games/team/${teamId}/season/${seasonYear}`
    );
    return this.unwrapArray<Game>(res.data);
  }

  // Helper: unwrap envelope-or-array into a plain array
async unwrapArray<T>(payload: ApiResponse<T[]> | T[]): T[] {
  return Array.isArray(payload) ? payload : (payload?.data ?? []);
}
  async getPreseasonGames(
    teamId?: number,
    seasonYear?: number
  ): Promise<Game[]> {
    console.log(
      `🔍 Game Service: Fetching games by season: ${seasonYear}` + ` and team:${teamId}`
    )
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            teamId: teamId,
            seasonYear: seasonYear,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(
        `❌ Failed to fetch games by season ${seasonYear} and teamId ${teamId}:`,
        error
      )
      throw error
    }
  }

  async getRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by season: ${seasonYear}`)
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            teamId: teamId,
            seasonYear: seasonYear,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(`❌ Failed to fetch games by season ${seasonYear}:`, error)
      throw error
    }
  }

  async getByTeamSeasonWeek(
    teamId?: number,
    seasonYear?: string,
    gameWeek?: number
  ): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by season: ${seasonYear}`)
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            teamId: teamId,
            seasonYear: seasonYear,
            gameWeek: gameWeek,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(`❌ Failed to fetch games by season ${seasonYear}:`, error)
      throw error
    }
  }

//async getUpcomingGames(teamId?: number, limit?: number): Promise<Game[]> {}
//async getCompletedGames(teamId?: number, limit?: number): Promise<Game[]> {}

  async create(
    data: Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>
  ): Promise<Game> {
    console.log('🔍 Game Service: Creating game:', data)
    console.log('🛠️ Payload being sent:', JSON.stringify(data, null, 2))
    try {
      const response = await apiService.post<ApiResponse<Game> | Game>(this.endpoint, data)
      console.log('🔍 Game Service: Create response:', response.data)

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game>
        return wrappedResponse.data
      } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        return response.data as Game
      } else {
        throw new Error('Invalid response structure from create game API')
      }
    } catch (error: any) {
      if (error.response) {
        console.error('❌ Server responded with error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      } else if (error.request) {
        console.error('❌ No response received from server:', error.request)
      } else {
        console.error('❌ Request setup error:', error.message)
      }
      throw error
    }
  }

  async update(
    id: number,
    data: Partial<Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>>
  ): Promise<Game> {
    console.log(`🔍 Game Service: Updating game ${id}:`, data)
    try {
      const response = await apiService.put<ApiResponse<Game> | Game>(
        `${this.endpoint}/${id}`,
        data
      )
      console.log('🔍 Game Service: Update response:', response.data)

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game>
        return wrappedResponse.data
      } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        return response.data as Game
      } else {
        throw new Error('Invalid response structure from update game API')
      }
    } catch (error: any) {
      console.error(`❌ Failed to update game ${id}:`, error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    console.log(`🔍 Game Service: Deleting game ${id}`)
    try {
      await apiService.delete(`${this.endpoint}/${id}`)
      console.log(`✅ Game ${id} deleted successfully`)
    } catch (error: any) {
      console.error(`❌ Failed to delete game ${id}:`, error)
      throw error
    }
  }

  // Helper method to manually populate team relationships if backend doesn't support includes
  async populateTeamRelationships(games: Game[]): Promise<Game[]> {
    console.log('🔍 Game Service: Manually populating team relationships...')

    try {
      // Extract unique team IDs
      const teamIds = new Set<number>()
      games.forEach(game => {
        teamIds.add(game.homeTeamId)
        teamIds.add(game.awayTeamId)
      })

      console.log(
        `🔍 Game Service: Need to fetch ${teamIds.size} unique teams:`,
        Array.from(teamIds)
      )

      // Fetch teams (assuming teams endpoint exists)
      const teamsMap = new Map<number, any>()

      for (const teamId of teamIds) {
        try {
          const response = await apiService.get(`/teams/${teamId}`)
          let teamData: any = null

          if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            teamData = response.data.data
          } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
            teamData = response.data
          } else {
            console.warn(`⚠️ Could not fetch team ${teamId}`)
            continue
          }

          teamsMap.set(teamId, teamData)
          console.log(`✅ Fetched team ${teamId}: ${teamData.name || teamData.city || 'Unknown'}`)
        } catch (error: any) {
          console.warn(`⚠️ Failed to fetch team ${teamId}:`, error.message)
          // Create a minimal team object as fallback
          teamsMap.set(teamId, {
            id: teamId,
            name: `Team ${teamId}`,
            city: null,
            state: null,
            conference: null,
            division: null,
            stadium: null,
          })
        }
      }

      // Populate team relationships in games
      const populatedGames = games.map(game => ({
        ...game,
        homeTeam: teamsMap.get(game.homeTeamId) || {
          id: game.homeTeamId,
          name: `Team ${game.homeTeamId}`,
          city: null,
          state: null,
          conference: null,
          division: null,
          stadium: null,
        },
        awayTeam: teamsMap.get(game.awayTeamId) || {
          id: game.awayTeamId,
          name: `Team ${game.awayTeamId}`,
          city: null,
          state: null,
          conference: null,
          division: null,
          stadium: null,
        },
      }))

      console.log(
        `✅ Game Service: Successfully populated team relationships for ${populatedGames.length} games`
      )
      return populatedGames
    } catch (error: any) {
      console.error('❌ Failed to populate team relationships:', error)
      // Return original games with fallback team objects
      return games.map(game => ({
        ...game,
        homeTeam: game.homeTeam || {
          id: game.homeTeamId,
          name: `Team ${game.homeTeamId}`,
          city: null,
          state: null,
          conference: null,
          division: null,
          stadium: null,
        },
        awayTeam: game.awayTeam || {
          id: game.awayTeamId,
          name: `Team ${game.awayTeamId}`,
          city: null,
          state: null,
          conference: null,
          division: null,
          stadium: null,
        },
      }))
    }
  }
}

export const gameService = new GameService()

