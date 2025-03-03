"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postSeasonResultController_1 = require("../controllers/postSeasonResultController");
const router = express_1.default.Router();
// GET /api/post-season-results - Get all post-season results
router.get('/', postSeasonResultController_1.getAllPostSeasonResults);
// GET /api/post-season-results/:id - Get post-season result by ID
router.get('/:id', postSeasonResultController_1.getPostSeasonResultById);
// GET /api/post-season-results/team/:teamId - Get post-season results by team ID
router.get('/team/:teamId', postSeasonResultController_1.getPostSeasonResultsByTeamId);
// GET /api/post-season-results/year/:year - Get post-season results by year
router.get('/year/:year', postSeasonResultController_1.getPostSeasonResultsByYear);
// POST /api/post-season-results - Create new post-season result
router.post('/', postSeasonResultController_1.createPostSeasonResult);
// PUT /api/post-season-results/:id - Update post-season result
router.put('/:id', postSeasonResultController_1.updatePostSeasonResult);
// DELETE /api/post-season-results/:id - Delete post-season result
router.delete('/:id', postSeasonResultController_1.deletePostSeasonResult);
exports.default = router;
