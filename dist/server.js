"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
// Import routes
const playerRoutes_1 = __importDefault(require("./modules/playerRoutes"));
const teamRoutes_1 = __importDefault(require("./modules/teamRoutes"));
const pickRoutes_1 = __importDefault(require("./modules/pickRoutes"));
const combineScoreRoutes_1 = __importDefault(require("./modules/combineScoreRoutes"));
const playerAwardRoutes_1 = __importDefault(require("./modules/playerAwardRoutes"));
const playerTeamRoutes_1 = __importDefault(require("./modules/playerTeamRoutes"));
const postSeasonResultRoutes_1 = __importDefault(require("./modules/postSeasonResultRoutes"));
const scheduleRoutes_1 = __importDefault(require("./modules/scheduleRoutes"));
const personRoutes_1 = __importDefault(require("./modules/personRoutes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
// Initialize Prisma client
exports.prisma = new client_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/players', playerRoutes_1.default);
app.use('/api/teams', teamRoutes_1.default);
app.use('/api/picks', pickRoutes_1.default);
app.use('/api/combine-scores', combineScoreRoutes_1.default);
app.use('/api/player-awards', playerAwardRoutes_1.default);
app.use('/api/player-teams', playerTeamRoutes_1.default);
app.use('/api/post-season-results', postSeasonResultRoutes_1.default);
app.use('/api/schedules', scheduleRoutes_1.default);
app.use('/api/persons', personRoutes_1.default);
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: err.message || 'Something went wrong on the server',
    });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Back Office Server (BOS) running on port ${PORT}`);
});
// Handle graceful shutdown
process.on('SIGINT', async () => {
    await exports.prisma.$disconnect();
    console.log('Prisma client disconnected');
    process.exit(0);
});
