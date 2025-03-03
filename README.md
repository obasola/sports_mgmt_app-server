# NFL Sports Management App Backend

A comprehensive RESTful API for managing NFL sports data, built with Node.js, Express, TypeScript, and Prisma ORM with MySQL database.

## Features

- Full CRUD operations for all entities
- TypeScript for type safety
- Prisma ORM for database interactions
- RESTful API design
- Error handling and validation
- Relationship management between entities

## Database Models

- Players
- Teams
- Picks (Draft picks)
- Combine Scores
- Player Awards
- Player-Team relationships
- Post-Season Results
- Schedules
- Users (Person)

## Prerequisites

- Node.js (v14+)
- MySQL database
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd sports-management-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following content:

```
DATABASE_URL="mysql://username:password@localhost:3306/sports_management_db"
PORT=3000
NODE_ENV=development
```

Replace `username`, `password`, and adjust the database name if needed.

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Create the database and run migrations:

```bash
npx prisma migrate dev --name init
```

## Running the Application

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm run build
npm start
```

## API Endpoints

### Players

- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player by ID
- `POST /api/players` - Create a new player
- `PUT /api/players/:id` - Update a player
- `DELETE /api/players/:id` - Delete a player
- `GET /api/players/team/:teamId` - Get players by team ID
- `GET /api/players/position/:position` - Get players by position

### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create a new team
- `PUT /api/teams/:id` - Update a team
- `DELETE /api/teams/:id` - Delete a team
- `GET /api/teams/conference/:conference` - Get teams by conference
- `GET /api/teams/division/:division` - Get teams by division

### Combine Scores

- `GET /api/combine-scores` - Get all combine scores
- `GET /api/combine-scores/:id` - Get combine score by ID
- `GET /api/combine-scores/player/:playerId` - Get combine score by player ID
- `POST /api/combine-scores` - Create a new combine score
- `PUT /api/combine-scores/:id` - Update a combine score
- `DELETE /api/combine-scores/:id` - Delete a combine score

### Picks

- `GET /api/picks` - Get all picks
- `GET /api/picks/:id` - Get pick by ID
- `GET /api/picks/player/:playerId` - Get picks by player ID
- `GET /api/picks/team/:teamId` - Get picks by team ID
- `GET /api/picks/year/:year` - Get picks by year
- `POST /api/picks` - Create a new pick
- `PUT /api/picks/:id` - Update a pick
- `DELETE /api/picks/:id` - Delete a pick

### Player Awards

- `GET /api/player-awards` - Get all player awards
- `GET /api/player-awards/:id` - Get player award by ID
- `GET /api/player-awards/player/:playerId` - Get awards by player ID
- `GET /api/player-awards/name/:awardName` - Get awards by award name
- `GET /api/player-awards/year/:year` - Get awards by year
- `POST /api/player-awards` - Create a new player award
- `PUT /api/player-awards/:id` - Update a player award
- `DELETE /api/player-awards/:id` - Delete a player award

### Player-Team Relationships

- `GET /api/player-teams` - Get all player-team relationships
- `GET /api/player-teams/:id` - Get player-team relationship by ID
- `GET /api/player-teams/player/:playerId` - Get teams by player ID
- `GET /api/player-teams/team/:teamId` - Get players by team ID
- `GET /api/player-teams/player/:playerId/current` - Get current team for player
- `POST /api/player-teams` - Create a new player-team relationship
- `PUT /api/player-teams/:id` - Update a player-team relationship
- `DELETE /api/player-teams/:id` - Delete a player-team relationship

### Post-Season Results

- `GET /api/post-season-results` - Get all post-season results
- `GET /api/post-season-results/:id` - Get post-season result by ID
- `GET /api/post-season-results/team/:teamId` - Get post-season results by team ID
- `GET /api/post-season-results/year/:year` - Get post-season results by year
- `POST /api/post-season-results` - Create a new post-season result
- `PUT /api/post-season-results/:id` - Update a post-season result
- `DELETE /api/post-season-results/:id` - Delete a post-season result

### Schedules

- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get schedule by ID
- `GET /api/schedules/team/:teamId` - Get schedules by team ID
- `GET /api/schedules/week/:week` - Get schedules by week
- `GET /api/schedules/date-range/:startDate/:endDate` - Get schedules by date range
- `POST /api/schedules` - Create a new schedule
- `PUT /api/schedules/:id` - Update a schedule
- `DELETE /api/schedules/:id` - Delete a schedule

### Users (Person)

- `GET /api/persons` - Get all persons
- `GET /api/persons/:id` - Get person by ID
- `GET /api/persons/username/:username` - Get person by username
- `GET /api/persons/email/:email` - Get person by email
- `POST /api/persons` - Create a new person
- `PUT /api/persons/:id` - Update a person
- `DELETE /api/persons/:id` - Delete a person
- `POST /api/persons/login` - Authenticate person (login)

## API Usage Examples

### Creating a New Player

```bash
curl -X POST http://localhost:3000/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Patrick",
    "lastName": "Mahomes",
    "age": 27,
    "height": 75.0,
    "weight": 230.0,
    "position": "Quarterback",
    "university": "Texas Tech",
    "homeCity": "Tyler",
    "homeState": "Texas",
    "year_entered_league": 2017
  }'
```

### Adding a Player to a Team

```bash
curl -X POST http://localhost:3000/api/player-teams \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": 1,
    "teamId": 12,
    "current_team": true,
    "start_date": "2017-04-27"
  }'
```

### Getting Players by Position

```bash
curl -X GET http://localhost:3000/api/players/position/Quarterback
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `204 No Content` - Request succeeded (for DELETE operations)
- `400 Bad Request` - Invalid input or validation error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include an error message:

```json
{
  "error": "Player not found"
}
```

## Project Structure

```
sports-management-app/
├── prisma/
│   ├── schema.prisma       # Prisma schema
│   └── migrations/         # Database migrations
├── src/
│   ├── controllers/        # Route controllers
│   ├── routes/             # API routes
│   ├── types/              # TypeScript type definitions
│   └── server.ts           # Express server setup
├── .env                    # Environment variables
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.