import express from 'express';
import {
  getAllPostSeasonResults,
  getPostSeasonResultById,
  getPostSeasonResultsByTeamId,
  getPostSeasonResultsByYear,
  createPostSeasonResult,
  updatePostSeasonResult,
  deletePostSeasonResult
} from '../controllers/postSeasonResultController';

const router = express.Router();

// GET /api/post-season-results - Get all post-season results
router.get('/', getAllPostSeasonResults);

// GET /api/post-season-results/:id - Get post-season result by ID
router.get('/:id', getPostSeasonResultById);

// GET /api/post-season-results/team/:teamId - Get post-season results by team ID
router.get('/team/:teamId', getPostSeasonResultsByTeamId);

// GET /api/post-season-results/year/:year - Get post-season results by year
router.get('/year/:year', getPostSeasonResultsByYear);

// POST /api/post-season-results - Create new post-season result
router.post('/', createPostSeasonResult);

// PUT /api/post-season-results/:id - Update post-season result
router.put('/:id', updatePostSeasonResult);

// DELETE /api/post-season-results/:id - Delete post-season result
router.delete('/:id', deletePostSeasonResult);

export default router;