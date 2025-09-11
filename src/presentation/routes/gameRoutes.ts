
/**
## 🎯 **Key Features Implemented**

### Business Logic:
- ✅ Game scheduling with conflict detection
- ✅ Score updates with validation
- ✅ Game status management (scheduled → in_progress → completed)
- ✅ Winner determination and tie detection
- ✅ Team validation (can't play themselves)

### Advanced Queries:
- ✅ Team schedule by season
- ✅ Upcoming games filtering
- ✅ Completed games with results
- ✅ Date range filtering
- ✅ Multi-team searches

### Validation & Constraints:
- ✅ Season year format validation
- ✅ Game week range (1-20)
- ✅ Non-negative scores
- ✅ Enum validation for game status
- ✅ Duplicate game prevention

### API Endpoints:
```
POST   /api/v1/games                     - Create game
GET    /api/v1/games                     - List games (with filters)
GET    /api/v1/games/upcoming            - Get upcoming games
GET    /api/v1/games/completed           - Get completed games
GET    /api/v1/games/:id                 - Get game by ID
PUT    /api/v1/games/:id                 - Update game
PATCH  /api/v1/games/:id/score           - Update game score
DELETE /api/v1/games/:id                 - Delete game
GET    /api/v1/games/team/:teamId/season/:seasonYear - Team schedule
```

## 🚀 **Testing Commands**
```bash
# Create a game
curl -X POST http://localhost:3000/api/v1/games \
  -H "Content-Type: application/json" \
  -d '{
    "seasonYear": "2024",
    "gameWeek": 1,
    "preseason": 1,
    "homeTeamId": 70,
    "awayTeamId": 63,
    "gameDate": "2025-08-08T20:00:00Z",
    "gameLocation": "AT&T Stadium",
    "gameCity": "Dallas",
    "gameStateProvince": "Texas",
    "gameCountry": "USA"
  }'

# Update game score
curl -X PATCH http://localhost:3000/api/v1/games/1/score \
  -H "Content-Type: application/json" \
  -d '{
    "homeScore": 24,
    "awayScore": 17,
    "gameStatus": "completed"
  }'

# Get team schedule
curl http://localhost:3000/api/v1/games/team/1/season/2024

# Get upcoming games
curl http://localhost:3000/api/v1/games/upcoming?teamId=1&limit=5
```

*/
// src/presentation/routes/gameRoutes.ts
import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { GameService } from '@/application/game/services/GameService';
import { PrismaGameRepository } from '@/infrastructure/repositories/PrismaGameRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateGameDtoSchema,
  UpdateGameDtoSchema,
  GameFiltersDtoSchema,
  PaginationDtoSchema,
  UpdateScoreDtoSchema,
} from '@/application/game/dto/GameDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const gameRepository = new PrismaGameRepository();
const gameService = new GameService(gameRepository);
const gameController = new GameController(gameService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const TeamSeasonParamsSchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number),
  seasonYear: z.string().regex(/^\d{4}$/, 'Season year must be a 4-digit year'),
});

const QuerySchema = GameFiltersDtoSchema.merge(PaginationDtoSchema);

// Main CRUD routes
router.post(
  '/',
  validateBody(CreateGameDtoSchema),
  gameController.createGame
);

router.get(
  '/',
  validateQuery(QuerySchema),
  gameController.getAllGames
);

router.get(
  '/upcoming',
  gameController.getUpcomingGames
);

router.get(
  '/completed',
  gameController.getCompletedGames
);
// Team-specific routes
router.get(
  '/team/:teamId/season/:seasonYear',
  validateParams(TeamSeasonParamsSchema),
  gameController.getTeamGames
);
router.get(
  '/:id',
  validateParams(IdParamsSchema),
  gameController.getGameById
);
router.get(
  '/preseason',
  gameController.getPreseasonGames
);

router.get(
  '/regular-season',
  gameController.getRegularSeasonGames
);
router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdateGameDtoSchema),
  gameController.updateGame
);

router.patch(
  '/:id/score',
  validateParams(IdParamsSchema),
  validateBody(UpdateScoreDtoSchema),
  gameController.updateGameScore
);

router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  gameController.deleteGame
);



export { router as gameRoutes };