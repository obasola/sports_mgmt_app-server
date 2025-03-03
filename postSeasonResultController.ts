import { Request, Response } from 'express';
import { prisma } from '../server';
import { PostSeasonResultCreateInput, PostSeasonResultUpdateInput } from '../types';

// Get all post-season results
export const getAllPostSeasonResults = async (req: Request, res: Response) => {
  try {
    const postSeasonResults = await prisma.post_Season_Result.findMany({
      include: {
        Team: true
      }
    });
    res.json(postSeasonResults);
  } catch (error) {
    console.error('Error fetching post-season results:', error);
    res.status(500).json({ error: 'Failed to fetch post-season results' });
  }
};

// Get post-season result by ID
export const getPostSeasonResultById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const postSeasonResult = await prisma.post_Season_Result.findUnique({
      where: { id: parseInt(id) },
      include: {
        Team: true
      }
    });
    
    if (!postSeasonResult) {
      return res.status(404).json({ error: 'Post-season result not found' });
    }
    
    res.json(postSeasonResult);
  } catch (error) {
    console.error(`Error fetching post-season result with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch post-season result' });
  }
};

// Get post-season results by team ID
export const getPostSeasonResultsByTeamId = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  
  try {
    const postSeasonResults = await prisma.post_Season_Result.findMany({
      where: { teamId: parseInt(teamId) },
      orderBy: {
        playoff_year: 'desc'
      }
    });
    
    res.json(postSeasonResults);
  } catch (error) {
    console.error(`Error fetching post-season results for team ID ${teamId}:`, error);
    res.status(500).json({ error: 'Failed to fetch post-season results for team' });
  }
};

// Get post-season results by year
export const getPostSeasonResultsByYear = async (req: Request, res: Response) => {
  const { year } = req.params;
  
  try {
    const postSeasonResults = await prisma.post_Season_Result.findMany({
      where: { playoff_year: parseInt(year) },
      include: {
        Team: true
      }
    });
    
    res.json(postSeasonResults);
  } catch (error) {
    console.error(`Error fetching post-season results for year ${year}:`, error);
    res.status(500).json({ error: 'Failed to fetch post-season results by year' });
  }
};

// Create new post-season result
export const createPostSeasonResult = async (req: Request, res: Response) => {
  const postSeasonResultData: PostSeasonResultCreateInput = req.body;
  
  try {
    const newPostSeasonResult = await prisma.post_Season_Result.create({
      data: postSeasonResultData
    });
    
    res.status(201).json(newPostSeasonResult);
  } catch (error) {
    console.error('Error creating post-season result:', error);
    res.status(400).json({ error: 'Failed to create post-season result' });
  }
};

// Update post-season result
export const updatePostSeasonResult = async (req: Request, res: Response) => {
  const { id } = req.params;
  const postSeasonResultData: PostSeasonResultUpdateInput = req.body;
  
  try {
    const updatedPostSeasonResult = await prisma.post_Season_Result.update({
      where: { id: parseInt(id) },
      data: postSeasonResultData
    });
    
    res.json(updatedPostSeasonResult);
  } catch (error) {
    console.error(`Error updating post-season result with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Post-season result not found' });
    }
    
    res.status(400).json({ error: 'Failed to update post-season result' });
  }
};

// Delete post-season result
export const deletePostSeasonResult = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.post_Season_Result.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting post-season result with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Post-season result not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete post-season result' });
  }
};