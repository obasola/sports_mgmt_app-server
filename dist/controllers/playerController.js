"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayersByPosition = exports.getPlayersByTeamId = exports.deletePlayer = exports.updatePlayer = exports.createPlayer = exports.getPlayerById = exports.getAllPlayers = void 0;
const server_1 = require("../server");
// Get all players
const getAllPlayers = async (req, res) => {
    try {
        const players = await server_1.prisma.player.findMany({
            include: {
                Combine_Score: true,
                Player_Award: true,
                Player_Team: {
                    include: {
                        Team: true,
                    },
                },
            },
        });
        res.json(players);
    }
    catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
};
exports.getAllPlayers = getAllPlayers;
// Get player by ID
const getPlayerById = async (req, res) => {
    const { id } = req.params;
    try {
        const player = await server_1.prisma.player.findUnique({
            where: { id: parseInt(id) },
            include: {
                Combine_Score: true,
                Player_Award: true,
                Player_Team: {
                    include: {
                        Team: true,
                    },
                },
                Pick: true,
            },
        });
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(player);
    }
    catch (error) {
        console.error(`Error fetching player with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch player' });
    }
};
exports.getPlayerById = getPlayerById;
// Create new player
const createPlayer = async (req, res) => {
    const playerData = req.body;
    try {
        const newPlayer = await server_1.prisma.player.create({
            data: playerData,
        });
        res.status(201).json(newPlayer);
    }
    catch (error) {
        console.error('Error creating player:', error);
        res.status(400).json({ error: 'Failed to create player' });
    }
};
exports.createPlayer = createPlayer;
// Update player
const updatePlayer = async (req, res) => {
    const { id } = req.params;
    const playerData = req.body;
    try {
        const updatedPlayer = await server_1.prisma.player.update({
            where: { id: parseInt(id) },
            data: playerData,
        });
        res.json(updatedPlayer);
    }
    catch (error) {
        console.error(`Error updating player with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.status(400).json({ error: 'Failed to update player' });
    }
};
exports.updatePlayer = updatePlayer;
// Delete player
const deletePlayer = async (req, res) => {
    const { id } = req.params;
    try {
        await server_1.prisma.player.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting player with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.status(500).json({ error: 'Failed to delete player' });
    }
};
exports.deletePlayer = deletePlayer;
// Get players by team ID
const getPlayersByTeamId = async (req, res) => {
    const { teamId } = req.params;
    try {
        const players = await server_1.prisma.player.findMany({
            where: {
                Player_Team: {
                    some: {
                        teamId: parseInt(teamId),
                    },
                },
            },
            include: {
                Combine_Score: true,
                Player_Award: true,
                Player_Team: {
                    include: {
                        Team: true,
                    },
                },
            },
        });
        res.json(players);
    }
    catch (error) {
        console.error(`Error fetching players for team ID ${teamId}:`, error);
        res.status(500).json({ error: 'Failed to fetch players for team' });
    }
};
exports.getPlayersByTeamId = getPlayersByTeamId;
// Get players by position
const getPlayersByPosition = async (req, res) => {
    const { position } = req.params;
    try {
        const players = await server_1.prisma.player.findMany({
            where: {
                position: position,
            },
            include: {
                Combine_Score: true,
                Player_Team: {
                    include: {
                        Team: true,
                    },
                },
            },
        });
        res.json(players);
    }
    catch (error) {
        console.error(`Error fetching players with position ${position}:`, error);
        res.status(500).json({ error: 'Failed to fetch players by position' });
    }
};
exports.getPlayersByPosition = getPlayersByPosition;
