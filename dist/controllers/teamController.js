"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamsByDivision = exports.getTeamsByConference = exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeamById = exports.getAllTeams = void 0;
const server_1 = require("../server");
// Get all teams
const getAllTeams = async (req, res) => {
    try {
        const teams = await server_1.prisma.team.findMany({
            include: {
                Player_Team: {
                    include: {
                        Player: true
                    }
                },
                Post_Season_Result: true
            }
        });
        res.json(teams);
    }
    catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
};
exports.getAllTeams = getAllTeams;
// Get team by ID
const getTeamById = async (req, res) => {
    const { id } = req.params;
    try {
        const team = await server_1.prisma.team.findUnique({
            where: { id: parseInt(id) },
            include: {
                Player_Team: {
                    include: {
                        Player: true
                    }
                },
                Post_Season_Result: true,
                Pick: true,
                Schedule_Schedule_homeTeamIdToTeam: true,
                Schedule_Schedule_awayTeamIdToTeam: true
            }
        });
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(team);
    }
    catch (error) {
        console.error(`Error fetching team with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
};
exports.getTeamById = getTeamById;
// Create new team
const createTeam = async (req, res) => {
    const teamData = req.body;
    try {
        const newTeam = await server_1.prisma.team.create({
            data: teamData
        });
        res.status(201).json(newTeam);
    }
    catch (error) {
        console.error('Error creating team:', error);
        res.status(400).json({ error: 'Failed to create team' });
    }
};
exports.createTeam = createTeam;
// Update team
const updateTeam = async (req, res) => {
    const { id } = req.params;
    const teamData = req.body;
    try {
        const updatedTeam = await server_1.prisma.team.update({
            where: { id: parseInt(id) },
            data: teamData
        });
        res.json(updatedTeam);
    }
    catch (error) {
        console.error(`Error updating team with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(400).json({ error: 'Failed to update team' });
    }
};
exports.updateTeam = updateTeam;
// Delete team
const deleteTeam = async (req, res) => {
    const { id } = req.params;
    try {
        await server_1.prisma.team.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting team with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(500).json({ error: 'Failed to delete team' });
    }
};
exports.deleteTeam = deleteTeam;
// Get teams by conference
const getTeamsByConference = async (req, res) => {
    const { conference } = req.params;
    try {
        const teams = await server_1.prisma.team.findMany({
            where: {
                conference: conference
            },
            include: {
                Player_Team: {
                    include: {
                        Player: true
                    }
                }
            }
        });
        res.json(teams);
    }
    catch (error) {
        console.error(`Error fetching teams in conference ${conference}:`, error);
        res.status(500).json({ error: 'Failed to fetch teams by conference' });
    }
};
exports.getTeamsByConference = getTeamsByConference;
// Get teams by division
const getTeamsByDivision = async (req, res) => {
    const { division } = req.params;
    try {
        const teams = await server_1.prisma.team.findMany({
            where: {
                division: division
            },
            include: {
                Player_Team: {
                    include: {
                        Player: true
                    }
                }
            }
        });
        res.json(teams);
    }
    catch (error) {
        console.error(`Error fetching teams in division ${division}:`, error);
        res.status(500).json({ error: 'Failed to fetch teams by division' });
    }
};
exports.getTeamsByDivision = getTeamsByDivision;
