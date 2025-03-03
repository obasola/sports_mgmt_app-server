import { Request, Response } from 'express';
import { prisma } from '../server';
import { PickCreateInput, PickUpdateInput } from '../types';

// Get all picks
export const getAllPicks = async (req: Request, res: Response) => {
  try {
    const picks = await prisma.pick.findMany({
      include: {
        Player: true,
        Team: true
      }
    });
    res.json(picks);
  } catch (error) {
    console.error('Error fetching picks:', error);
    res.status(500).json({ error: 'Failed to fetch picks' });
  }
};

// Get pick by ID
export const getPickById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const pick = await prisma.pick.findUnique({
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
  } catch (error) {
    console.error(`Error fetching pick with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch pick' });
  }
};

// Get picks by player ID
export const getPicksByPlayerId = async (req: Request, res: Response) => {
  const { playerId } = req.params;
  
  try {
    const picks = await prisma.pick.findMany({
      where: { Player_id: parseInt(playerId) },
      include: {
        Team: true
      }
    });
    
    res.json(picks);
  } catch (error) {
    console.error(`Error fetching picks for player ID ${playerId}:`, error);
    res.status(500).json({ error: 'Failed to fetch picks for player' });
  }
};

// Get picks by team ID
export const getPicksByTeamId = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  
  try {
    const picks = await prisma.pick.findMany({
      where: { Team_id: parseInt(teamId) },
      include: {
        Player: true
      }
    });
    
    res.json(picks);
  } catch (error) {
    console.error(`Error fetching picks for team ID ${teamId}:`, error);
    res.status(500).json({ error: 'Failed to fetch picks for team' });
  }
};

// Get picks by year
export const getPicksByYear = async (req: Request, res: Response) => {
  const { year } = req.params;
  
  try {
    const picks = await prisma.pick.findMany({
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
  } catch (error) {
    console.error(`Error fetching picks for year ${year}:`, error);
    res.status(500).json({ error: 'Failed to fetch picks for year' });
  }
};

// Create new pick
export const createPick = async (req: Request, res: Response) => {
  const pickData: PickCreateInput = req.body;
  
  try {
    const newPick = await prisma.pick.create({
      data: pickData
    });
    
    res.status(201).json(newPick);
  } catch (error) {
    console.error('Error creating pick:', error);
    res.status(400).json({ error: 'Failed to create pick' });
  }
};

// Update pick
export const updatePick = async (req: Request, res: Response) => {
  const { id } = req.params;
  const pickData: PickUpdateInput = req.body;
  
  try {
    const updatedPick = await prisma.pick.update({
      where: { id: parseInt(id) },
      data: pickData
    });
    
    res.json(updatedPick);
  } catch (error) {
    console.error(`Error updating pick with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Pick not found' });
    }
    
    res.status(400).json({ error: 'Failed to update pick' });
  }
};

// Delete pick
export const deletePick = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.pick.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting pick with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Pick not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete pick' });
  }
};