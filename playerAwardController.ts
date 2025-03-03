import { Request, Response } from 'express';
import { prisma } from '../server';
import { PlayerAwardCreateInput, PlayerAwardUpdateInput } from '../types';

// Get all player awards
export const getAllPlayerAwards = async (req: Request, res: Response) => {
  try {
    const playerAwards = await prisma.player_Award.findMany({
      include: {
        Player: true
      }
    });
    res.json(playerAwards);
  } catch (error) {
    console.error('Error fetching player awards:', error);
    res.status(500).json({ error: 'Failed to fetch player awards' });
  }
};

// Get player award by ID
export const getPlayerAwardById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const playerAward = await prisma.player_Award.findUnique({
      where: { id: parseInt(id) },
      include: {
        Player: true
      }
    });
    
    if (!playerAward) {
      return res.status(404).json({ error: 'Player award not found' });
    }
    
    res.json(playerAward);
  } catch (error) {
    console.error(`Error fetching player award with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch player award' });
  }
};

// Get awards by player ID
export const getAwardsByPlayerId = async (req: Request, res: Response) => {
  const { playerId } = req.params;
  
  try {
    const playerAwards = await prisma.player_Award.findMany({
      where: { playerId: parseInt(playerId) },
      orderBy: {
        year_awarded: 'desc'
      }
    });
    
    res.json(playerAwards);
  } catch (error) {
    console.error(`Error fetching awards for player ID ${playerId}:`, error);
    res.status(500).json({ error: 'Failed to fetch awards for player' });
  }
};

// Get awards by award name
export const getAwardsByName = async (req: Request, res: Response) => {
  const { awardName } = req.params;
  
  try {
    const playerAwards = await prisma.player_Award.findMany({
      where: { award_name: awardName },
      include: {
        Player: true
      },
      orderBy: {
        year_awarded: 'desc'
      }
    });
    
    res.json(playerAwards);
  } catch (error) {
    console.error(`Error fetching awards with name ${awardName}:`, error);
    res.status(500).json({ error: 'Failed to fetch awards by name' });
  }
};

// Get awards by year
export const getAwardsByYear = async (req: Request, res: Response) => {
  const { year } = req.params;
  
  try {
    const playerAwards = await prisma.player_Award.findMany({
      where: { year_awarded: parseInt(year) },
      include: {
        Player: true
      }
    });
    
    res.json(playerAwards);
  } catch (error) {
    console.error(`Error fetching awards for year ${year}:`, error);
    res.status(500).json({ error: 'Failed to fetch awards by year' });
  }
};

// Create new player award
export const createPlayerAward = async (req: Request, res: Response) => {
  const playerAwardData: PlayerAwardCreateInput = req.body;
  
  try {
    const newPlayerAward = await prisma.player_Award.create({
      data: playerAwardData
    });
    
    res.status(201).json(newPlayerAward);
  } catch (error) {
    console.error('Error creating player award:', error);
    res.status(400).json({ error: 'Failed to create player award' });
  }
};

// Update player award
export const updatePlayerAward = async (req: Request, res: Response) => {
  const { id } = req.params;
  const playerAwardData: PlayerAwardUpdateInput = req.body;
  
  try {
    const updatedPlayerAward = await prisma.player_Award.update({
      where: { id: parseInt(id) },
      data: playerAwardData
    });
    
    res.json(updatedPlayerAward);
  } catch (error) {
    console.error(`Error updating player award with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Player award not found' });
    }
    
    res.status(400).json({ error: 'Failed to update player award' });
  }
};

// Delete player award
export const deletePlayerAward = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.player_Award.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting player award with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Player award not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete player award' });
  }
};