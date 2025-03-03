"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayerAward = exports.updatePlayerAward = exports.createPlayerAward = exports.getAwardsByYear = exports.getAwardsByName = exports.getAwardsByPlayerId = exports.getPlayerAwardById = exports.getAllPlayerAwards = void 0;
const server_1 = require("../server");
// Get all player awards
const getAllPlayerAwards = async (req, res) => {
    try {
        const playerAwards = await server_1.prisma.player_Award.findMany({
            include: {
                Player: true
            }
        });
        res.json(playerAwards);
    }
    catch (error) {
        console.error('Error fetching player awards:', error);
        res.status(500).json({ error: 'Failed to fetch player awards' });
    }
};
exports.getAllPlayerAwards = getAllPlayerAwards;
// Get player award by ID
const getPlayerAwardById = async (req, res) => {
    const { id } = req.params;
    try {
        const playerAward = await server_1.prisma.player_Award.findUnique({
            where: { id: parseInt(id) },
            include: {
                Player: true
            }
        });
        if (!playerAward) {
            return res.status(404).json({ error: 'Player award not found' });
        }
        res.json(playerAward);
    }
    catch (error) {
        console.error(`Error fetching player award with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch player award' });
    }
};
exports.getPlayerAwardById = getPlayerAwardById;
// Get awards by player ID
const getAwardsByPlayerId = async (req, res) => {
    const { playerId } = req.params;
    try {
        const playerAwards = await server_1.prisma.player_Award.findMany({
            where: { playerId: parseInt(playerId) },
            orderBy: {
                year_awarded: 'desc'
            }
        });
        res.json(playerAwards);
    }
    catch (error) {
        console.error(`Error fetching awards for player ID ${playerId}:`, error);
        res.status(500).json({ error: 'Failed to fetch awards for player' });
    }
};
exports.getAwardsByPlayerId = getAwardsByPlayerId;
// Get awards by award name
const getAwardsByName = async (req, res) => {
    const { awardName } = req.params;
    try {
        const playerAwards = await server_1.prisma.player_Award.findMany({
            where: { award_name: awardName },
            include: {
                Player: true
            },
            orderBy: {
                year_awarded: 'desc'
            }
        });
        res.json(playerAwards);
    }
    catch (error) {
        console.error(`Error fetching awards with name ${awardName}:`, error);
        res.status(500).json({ error: 'Failed to fetch awards by name' });
    }
};
exports.getAwardsByName = getAwardsByName;
// Get awards by year
const getAwardsByYear = async (req, res) => {
    const { year } = req.params;
    try {
        const playerAwards = await server_1.prisma.player_Award.findMany({
            where: { year_awarded: parseInt(year) },
            include: {
                Player: true
            }
        });
        res.json(playerAwards);
    }
    catch (error) {
        console.error(`Error fetching awards for year ${year}:`, error);
        res.status(500).json({ error: 'Failed to fetch awards by year' });
    }
};
exports.getAwardsByYear = getAwardsByYear;
// Create new player award
const createPlayerAward = async (req, res) => {
    const playerAwardData = req.body;
    try {
        const newPlayerAward = await server_1.prisma.player_Award.create({
            data: playerAwardData
        });
        res.status(201).json(newPlayerAward);
    }
    catch (error) {
        console.error('Error creating player award:', error);
        res.status(400).json({ error: 'Failed to create player award' });
    }
};
exports.createPlayerAward = createPlayerAward;
// Update player award
const updatePlayerAward = async (req, res) => {
    const { id } = req.params;
    const playerAwardData = req.body;
    try {
        const updatedPlayerAward = await server_1.prisma.player_Award.update({
            where: { id: parseInt(id) },
            data: playerAwardData
        });
        res.json(updatedPlayerAward);
    }
    catch (error) {
        console.error(`Error updating player award with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return res.status(404).json({ error: 'Player award not found' });
        }
        res.status(400).json({ error: 'Failed to update player award' });
    }
};
exports.updatePlayerAward = updatePlayerAward;
// Delete player award
const deletePlayerAward = async (req, res) => {
    const { id } = req.params;
    try {
        await server_1.prisma.player_Award.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting player award with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Player award not found' });
        }
        res.status(500).json({ error: 'Failed to delete player award' });
    }
};
exports.deletePlayerAward = deletePlayerAward;
