// src/api/swagger-components.ts
/**
 * @swagger
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - position
 *       properties:
 *         id:
 *           type: integer
 *           description: The player ID
 *         firstName:
 *           type: string
 *           description: The player's first name
 *         lastName:
 *           type: string
 *           description: The player's last name
 *         position:
 *           type: string
 *           description: The player's position
 *         height:
 *           type: string
 *           description: The player's height
 *         weight:
 *           type: number
 *           description: The player's weight in pounds
 *         college:
 *           type: string
 *           description: The player's college
 *       example:
 *         id: 1
 *         firstName: Patrick
 *         lastName: Mahomes
 *         position: QB
 *         height: "6-2"
 *         weight: 225
 *         college: Texas Tech
 *
 *     Team:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The team ID
 *         name:
 *           type: string
 *           description: The team name
 *         city:
 *           type: string
 *           description: The team city
 *         state:
 *           type: string
 *           description: The team state
 *         conference:
 *           type: string
 *           description: The team conference
 *         division:
 *           type: string
 *           description: The team division
 *         stadium:
 *           type: string
 *           description: The team stadium
 *       example:
 *         id: 1
 *         name: Chiefs
 *         city: Kansas City
 *         state: Missouri
 *         conference: AFC
 *         division: West
 *         stadium: Arrowhead Stadium
 *
 *     PlayerTeam:
 *       type: object
 *       required:
 *         - playerId
 *         - teamId
 *         - startDate
 *       properties:
 *         id:
 *           type: integer
 *           description: The relationship ID
 *         playerId:
 *           type: integer
 *           description: The player ID
 *         teamId:
 *           type: integer
 *           description: The team ID
 *         startDate:
 *           type: string
 *           format: date
 *           description: The start date with the team
 *         endDate:
 *           type: string
 *           format: date
 *           description: The end date with the team (null if current)
 *       example:
 *         id: 1
 *         playerId: 1
 *         teamId: 1
 *         startDate: "2017-04-27"
 *         endDate: null
 *
 *     PlayerAward:
 *       type: object
 *       required:
 *         - playerId
 *       properties:
 *         id:
 *           type: integer
 *           description: The award ID
 *         playerId:
 *           type: integer
 *           description: The player ID
 *         awardName:
 *           type: string
 *           description: The name of the award
 *         yearAwarded:
 *           type: integer
 *           description: The year the award was given
 *       example:
 *         id: 1
 *         playerId: 1
 *         awardName: MVP
 *         yearAwarded: 2022
 *
 *     PostSeasonResult:
 *       type: object
 *       required:
 *         - playoffYear
 *       properties:
 *         id:
 *           type: integer
 *           description: The result ID
 *         playoffYear:
 *           type: integer
 *           description: The year of the playoff
 *         lastRoundReached:
 *           type: string
 *           description: The last round reached in playoffs
 *         winLose:
 *           type: string
 *           enum: [W, L]
 *           description: Whether the team won or lost in that round
 *         opponentScore:
 *           type: integer
 *           description: The opponent's score
 *         teamScore:
 *           type: integer
 *           description: The team's score
 *         teamId:
 *           type: integer
 *           description: The team ID
 *       example:
 *         id: 1
 *         playoffYear: 2023
 *         lastRoundReached: "Super Bowl"
 *         winLose: "W"
 *         opponentScore: 35
 *         teamScore: 38
 *         teamId: 1
 *
 *     Schedule:
 *       type: object
 *       required:
 *         - seasonYear
 *         - oppTeamId
 *       properties:
 *         id:
 *           type: integer
 *           description: The schedule ID
 *         teamId:
 *           type: integer
 *           description: The team ID
 *         seasonYear:
 *           type: string
 *           description: The season year
 *         oppTeamId:
 *           type: integer
 *           description: The opponent team ID
 *         scheduleWeek:
 *           type: integer
 *           description: The week number
 *         gameDate:
 *           type: string
 *           format: date
 *           description: The date of the game
 *         homeOrAway:
 *           type: string
 *           enum: [H, A]
 *           description: Whether the game is home or away
 *         teamScore:
 *           type: integer
 *           description: The team's score
 *         oppTeamScore:
 *           type: integer
 *           description: The opponent's score
 *       example:
 *         id: 1
 *         teamId: 1
 *         seasonYear: "2023"
 *         oppTeamId: 2
 *         scheduleWeek: 1
 *         gameDate: "2023-09-07"
 *         homeOrAway: "H"
 *         teamScore: 27
 *         oppTeamScore: 24
 *
 *     TeamNeed:
 *       type: object
 *       required:
 *         - teamId
 *         - position
 *       properties:
 *         id:
 *           type: integer
 *           description: The team need ID
 *         teamId:
 *           type: integer
 *           description: The team ID
 *         position:
 *           type: string
 *           description: The position needed
 *         priority:
 *           type: integer
 *           description: The priority level (1 is highest)
 *         draftYear:
 *           type: string
 *           format: date
 *           description: The year to address this need
 *       example:
 *         id: 1
 *         teamId: 1
 *         position: "CB"
 *         priority: 1
 *         draftYear: "2024-04-01"
 *
 *   responses:
 *     BadRequest:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     NotFound:
 *       description: The specified resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 */
