"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePick = exports.updatePick = exports.createPick = exports.getPicksByYear = exports.getPicksByTeamId = exports.getPicksByPlayerId = exports.getPickById = exports.getAllPicks = void 0;
const server_1 = require("../server");
// Get all picks
const getAllPicks = async (req, res) => {
    try {
        const picks = await server_1.prisma.pick.findMany({
            include: {
                Player: true,
                Team: true
            }
        });
        res.json(picks);
    }
    catch (error) {
        console.error('Error fetching picks:', error);
        res.status(500).json({ error: 'Failed to fetch picks' });
    }
};
exports.getAllPicks = getAllPicks;
// Get pick by ID
const getPickById = async (req, res) => {
    const { id } = req.params;
    try {
        const pick = await server_1.prisma.pick.findUnique({
            where: { id: parseInt(id) },
            include: {
                Player: true,
                Team: true
            }
        });
        if (!pick) {
            return res.status(404).json({ error: 'Pick not found' });
        }
        res.json(pick);
    }
    catch (error) {
        console.error(`Error fetching pick with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch pick' });
    }
};
exports.getPickById = getPickById;
// Get picks by player ID
const getPicksByPlayerId = async (req, res) => {
    const { playerId } = req.params;
    try {
        const picks = await server_1.prisma.pick.findMany({
            where: { Player_id: parseInt(playerId) },
            include: {
                Team: true
            }
        });
        res.json(picks);
    }
    catch (error) {
        console.error(`Error fetching picks for player ID ${playerId}:`, error);
        res.status(500).json({ error: 'Failed to fetch picks for player' });
    }
};
exports.getPicksByPlayerId = getPicksByPlayerId;
// Get picks by team ID
const getPicksByTeamId = async (req, res) => {
    const { teamId } = req.params;
    try {
        const picks = await server_1.prisma.pick.findMany({
            where: { Team_id: parseInt(teamId) },
            include: {
                Player: true
            }
        });
        res.json(picks);
    }
    catch (error) {
        console.error(`Error fetching picks for team ID ${teamId}:`, error);
        res.status(500).json({ error: 'Failed to fetch picks for team' });
    }
};
exports.getPicksByTeamId = getPicksByTeamId;
// Get picks by year
const getPicksByYear = async (req, res) => {
    const { year } = req.params;
    try {
        const picks = await server_1.prisma.pick.findMany({
            where: { selectionYear: year },
            include: {
                Player: true,
                Team: true
            },
            orderBy: {
                selectionNumber: 'asc'
            }
        });
        res.json(picks);
    }
    catch (error) {
        console.error(`Error fetching picks for year ${year}:`, error);
        res.status(500).json({ error: 'Failed to fetch picks for year' });
    }
};
exports.getPicksByYear = getPicksByYear;
// Create new pick
const createPick = async (req, res) => {
    const pickData = req.body;
    try {
        const newPick = await server_1.prisma.pick.create({
            data: pickData
        });
        res.status(201).json(newPick);
    }
    catch (error) {
        console.error('Error creating pick:', error);
        res.status(400).json({ error: 'Failed to create pick' });
    }
};
exports.createPick = createPick;
// Update pick
const updatePick = async (req, res) => {
    const { id } = req.params;
    const pickData = req.body;
    try {
        const updatedPick = await server_1.prisma.pick.update({
            where: { id: parseInt(id) },
            data: pickData
        });
        res.json(updatedPick);
    }
    catch (error) {
        console.error(`Error updating pick with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return res.status(404).json({ error: 'Pick not found' });
        }
        res.status(400).json({ error: 'Failed to update pick' });
    }
};
exports.updatePick = updatePick;
// Delete pick
const deletePick = async (req, res) => {
    const { id } = req.params;
    try {
        await server_1.prisma.pick.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting pick with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Pick not found' });
        }
        res.status(500).json({ error: 'Failed to delete pick' });
    }
};
exports.deletePick = deletePick;
