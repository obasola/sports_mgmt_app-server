"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePostSeasonResult = exports.updatePostSeasonResult = exports.createPostSeasonResult = exports.getPostSeasonResultsByYear = exports.getPostSeasonResultsByTeamId = exports.getPostSeasonResultById = exports.getAllPostSeasonResults = void 0;
const server_1 = require("../server");
// Get all post-season results
const getAllPostSeasonResults = async (req, res) => {
    try {
        const postSeasonResults = await server_1.prisma.post_Season_Result.findMany({
            include: {
                Team: true
            }
        });
        res.json(postSeasonResults);
    }
    catch (error) {
        console.error('Error fetching post-season results:', error);
        res.status(500).json({ error: 'Failed to fetch post-season results' });
    }
};
exports.getAllPostSeasonResults = getAllPostSeasonResults;
// Get post-season result by ID
const getPostSeasonResultById = async (req, res) => {
    const { id } = req.params;
    try {
        const postSeasonResult = await server_1.prisma.post_Season_Result.findUnique({
            where: { id: parseInt(id) },
            include: {
                Team: true
            }
        });
        if (!postSeasonResult) {
            return res.status(404).json({ error: 'Post-season result not found' });
        }
        res.json(postSeasonResult);
    }
    catch (error) {
        console.error(`Error fetching post-season result with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch post-season result' });
    }
};
exports.getPostSeasonResultById = getPostSeasonResultById;
// Get post-season results by team ID
const getPostSeasonResultsByTeamId = async (req, res) => {
    const { teamId } = req.params;
    try {
        const postSeasonResults = await server_1.prisma.post_Season_Result.findMany({
            where: { teamId: parseInt(teamId) },
            orderBy: {
                playoff_year: 'desc'
            }
        });
        res.json(postSeasonResults);
    }
    catch (error) {
        console.error(`Error fetching post-season results for team ID ${teamId}:`, error);
        res.status(500).json({ error: 'Failed to fetch post-season results for team' });
    }
};
exports.getPostSeasonResultsByTeamId = getPostSeasonResultsByTeamId;
// Get post-season results by year
const getPostSeasonResultsByYear = async (req, res) => {
    const { year } = req.params;
    try {
        const postSeasonResults = await server_1.prisma.post_Season_Result.findMany({
            where: { playoff_year: parseInt(year) },
            include: {
                Team: true
            }
        });
        res.json(postSeasonResults);
    }
    catch (error) {
        console.error(`Error fetching post-season results for year ${year}:`, error);
        res.status(500).json({ error: 'Failed to fetch post-season results by year' });
    }
};
exports.getPostSeasonResultsByYear = getPostSeasonResultsByYear;
// Create new post-season result
const createPostSeasonResult = async (req, res) => {
    const postSeasonResultData = req.body;
    try {
        const newPostSeasonResult = await server_1.prisma.post_Season_Result.create({
            data: postSeasonResultData
        });
        res.status(201).json(newPostSeasonResult);
    }
    catch (error) {
        console.error('Error creating post-season result:', error);
        res.status(400).json({ error: 'Failed to create post-season result' });
    }
};
exports.createPostSeasonResult = createPostSeasonResult;
// Update post-season result
const updatePostSeasonResult = async (req, res) => {
    const { id } = req.params;
    const postSeasonResultData = req.body;
    try {
        const updatedPostSeasonResult = await server_1.prisma.post_Season_Result.update({
            where: { id: parseInt(id) },
            data: postSeasonResultData
        });
        res.json(updatedPostSeasonResult);
    }
    catch (error) {
        console.error(`Error updating post-season result with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return res.status(404).json({ error: 'Post-season result not found' });
        }
        res.status(400).json({ error: 'Failed to update post-season result' });
    }
};
exports.updatePostSeasonResult = updatePostSeasonResult;
// Delete post-season result
const deletePostSeasonResult = async (req, res) => {
    const { id } = req.params;
    try {
        await server_1.prisma.post_Season_Result.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting post-season result with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Post-season result not found' });
        }
        res.status(500).json({ error: 'Failed to delete post-season result' });
    }
};
exports.deletePostSeasonResult = deletePostSeasonResult;
