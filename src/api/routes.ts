import { Router } from 'express';
import playerRouter from '../modules/player/presentation/player.routes';
import teamRouter from '../modules/team/presentation/team.routes';
import playerTeamRouter from '../modules/player/presentation/player-team.routes';
import prospectRouter from '../modules/prospect/presentation/prospect.routes';
import combineScoreRouter from '../modules/combine/presentation/combine-score.routes';
import draftPickRouter from '../modules/draft/presentation/draft-pick.routes';
import personRouter from '../modules/person/presentation/person.routes';
import { playerAwardRouter } from '../modules/player/presentation/player-award.routes';
import { postSeasonResultRouter } from '@/modules/postSeasonResult/presentation/post-season-result.routes';

// Create router
const router = Router();

// Base route
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Sports Management API',
    version: '1.0.0',
  });
});

// Register domain routes
router.use('/players', playerRouter);
router.use('/teams', teamRouter);
router.use('/player-teams', playerTeamRouter);
router.use('/prospects', prospectRouter);
router.use('/post-season-results', postSeasonResultRouter);
router.use('/combine-scores', combineScoreRouter);
router.use('/draft-picks', draftPickRouter);
router.use('/persons', personRouter);
router.use('/player-awards', playerAwardRouter);

console.log('Available routes:', router.stack.map(r => r.route?.path).filter(Boolean));
export default router;
