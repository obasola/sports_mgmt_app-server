import { Request, Response } from 'express';
import { prisma } from '../server';
import { PlayerCreateInput, PlayerUpdateInput } from '../types';

// Get all players
export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await prisma.player.findMany({
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
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
};

// Get player by ID
export const getPlayerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const player = await prisma.player.findUnique({
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
  } catch (error) {
    console.error(`Error fetching player with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
};

// Create new player
export const createPlayer = async (req: Request, res: Response) => {
  const playerData: PlayerCreateInput = req.body;
  
  try {
    const newPlayer = await prisma.player.create({
      data: playerData,
    });
    
    res.status(201).json(newPlayer);
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(400).json({ error: 'Failed to create player' });
  }
};

// Update player
export const updatePlayer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const playerData: PlayerUpdateInput = req.body;
  
  try {
    const updatedPlayer = await prisma.player.update({
      where: { id: parseInt(id) },
      data: playerData,
    });
    
    res.json(updatedPlayer);
  } catch (error) {
    console.error(`Error updating player with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.status(400).json({ error: 'Failed to update player' });
  }
};

// Delete player
export const deletePlayer = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.player.delete({
      where: { id: parseInt(id) },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting player with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete player' });
  }
};

// Get players by team ID
export const getPlayersByTeamId = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  
  try {
    const players = await prisma.player.findMany({
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
  } catch (error) {
    console.error(`Error fetching players for team ID ${teamId}:`, error);
    res.status(500).json({ error: 'Failed to fetch players for team' });
  }
};

// Get players by position
export const getPlayersByPosition = async (req: Request, res: Response) => {
  const { position } = req.params;
  
  try {
    const players = await prisma.player.findMany({
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
  } catch (error) {
    console.error(`Error fetching players with position ${position}:`, error);
    res.status(500).json({ error: 'Failed to fetch players by position' });
  }
};