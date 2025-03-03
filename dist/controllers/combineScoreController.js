"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCombineScore = exports.updateCombineScore = exports.createCombineScore = exports.getCombineScoreByPlayerId = exports.getCombineScoreById = exports.getAllCombineScores = void 0;
const server_1 = require("../server");
// Get all combine scores
const getAllCombineScores = async (req, res) => {
    try {
        const combineScores = await server_1.prisma.combine_Score.findMany({
            include: {
                Player: true
            }
        });
        res.json(combineScores);
    }
    catch (error) {
        console.error('Error fetching combine scores:', error);
        res.status(500).json({ error: 'Failed to fetch combine scores' });
    }
};
exports.getAllCombineScores = getAllCombineScores;
// Get combine score by ID
const getCombineScoreById = async (req, res) => {
    const { id } = req.params;
    try {
        const combineScore = await server_1.prisma.combine_Score.findUnique({
            where: { id: parseInt(id) },
            include: {
                Player: true
            }
        });
        if (!combineScore) {
            return res.status(404).json({ error: 'Combine score not found' });
        }
        res.json(combineScore);
    }
    catch (error) {
        console.error(`Error fetching combine score with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch combine score' });
    }
};
exports.getCombineScoreById = getCombineScoreById;
// Get combine score by player ID
const getCombineScoreByPlayerId = async (req, res) => {
    const { playerId } = req.params;
    try {
        const combineScore = await server_1.prisma.combine_Score.findFirst({
            where: { playerId: parseInt(playerId) },
            include: {
                Player: true
            }
        });
        if (!combineScore) {
            return res.status(404).json({ error: 'Combine score not found for this player' });
        }
        res.json(combineScore);
    }
    catch (error) {
        console.error(`Error fetching combine score for player ID ${playerId}:`, error);
        res.status(500).json({ error: 'Failed to fetch combine score for player' });
    }
};
exports.getCombineScoreByPlayerId = getCombineScoreByPlayerId;
// Create new combine score
const createCombineScore = async (req, res) => {
    const combineScoreData = req.body;
    try {
        const newCombineScore = await server_1.prisma.combine_Score.create({
            data: combineScoreData
        });
        res.status(201).json(newCombineScore);
    }
    catch (error) {
        console.error('Error creating combine score:', error);
        res.status(400).json({ error: 'Failed to create combine score' });
    }
};
exports.createCombineScore = createCombineScore;
// Update combine score
const updateCombineScore = async (req, res) => {
    const { id } = req.params;
    const combineScoreData = req.body;
    try {
        const updatedCombineScore = await server_1.prisma.combine_Score.update({
            where: { id: parseInt(id) },
            data: combineScoreData
        });
        res.json(updatedCombineScore);
    }
    catch (error) {
        console.error(`Error updating combine score with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return res.status(404).json({ error: 'Combine score not found' });
        }
        res.status(400).json({ error: 'Failed to update combine score' });
    }
};
exports.updateCombineScore = updateCombineScore;
// Delete combine score
const deleteCombineScore = async (req, res) => {
    const { id } = req.params;
    try {
        await server_1.prisma.combine_Score.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting combine score with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Combine score not found' });
        }
        res.status(500).json({ error: 'Failed to delete combine score' });
    }
};
exports.deleteCombineScore = deleteCombineScore;
