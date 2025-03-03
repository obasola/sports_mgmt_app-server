import { Request, Response } from 'express';
import { prisma } from '../server';
import { CombineScoreCreateInput, CombineScoreUpdateInput } from '../types';

// Get all combine scores
export const getAllCombineScores = async (req: Request, res: Response) => {
  try {
    const combineScores = await prisma.combine_Score.findMany({
      include: {
        Player: true
      }
    });
    res.json(combineScores);
  } catch (error) {
    console.error('Error fetching combine scores:', error);
    res.status(500).json({ error: 'Failed to fetch combine scores' });
  }
};

// Get combine score by ID
export const getCombineScoreById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const combineScore = await prisma.combine_Score.findUnique({
      where: { id: parseInt(id) },
      include: {
        Player: true
      }
    });
    
    if (!combineScore) {
      return res.status(404).json({ error: 'Combine score not found' });
    }
    
    res.json(combineScore);
  } catch (error) {
    console.error(`Error fetching combine score with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch combine score' });
  }
};

// Get combine score by player ID
export const getCombineScoreByPlayerId = async (req: Request, res: Response) => {
  const { playerId } = req.params;
  
  try {
    const combineScore = await prisma.combine_Score.findFirst({
      where: { playerId: parseInt(playerId) },
      include: {
        Player: true
      }
    });
    
    if (!combineScore) {
      return res.status(404).json({ error: 'Combine score not found for this player' });
    }
    
    res.json(combineScore);
  } catch (error) {
    console.error(`Error fetching combine score for player ID ${playerId}:`, error);
    res.status(500).json({ error: 'Failed to fetch combine score for player' });
  }
};

// Create new combine score
export const createCombineScore = async (req: Request, res: Response) => {
  const combineScoreData: CombineScoreCreateInput = req.body;
  
  try {
    const newCombineScore = await prisma.combine_Score.create({
      data: combineScoreData
    });
    
    res.status(201).json(newCombineScore);
  } catch (error) {
    console.error('Error creating combine score:', error);
    res.status(400).json({ error: 'Failed to create combine score' });
  }
};

// Update combine score
export const updateCombineScore = async (req: Request, res: Response) => {
  const { id } = req.params;
  const combineScoreData: CombineScoreUpdateInput = req.body;
  
  try {
    const updatedCombineScore = await prisma.combine_Score.update({
      where: { id: parseInt(id) },
      data: combineScoreData
    });
    
    res.json(updatedCombineScore);
  } catch (error) {
    console.error(`Error updating combine score with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Combine score not found' });
    }
    
    res.status(400).json({ error: 'Failed to update combine score' });
  }
};

// Delete combine score
export const deleteCombineScore = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.combine_Score.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting combine score with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Combine score not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete combine score' });
  }
};