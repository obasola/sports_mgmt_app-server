import { Request, Response } from 'express';
import { prisma } from '../server';
import { PlayerTeamCreateInput, PlayerTeamUpdateInput } from '../types';

// Get all player-team relationships
export const getAllPlayerTeams = async (req: Request, res: Response) => {
  try {
    const playerTeams = await prisma.player_Team.findMany({
      include: {
        Player: true,
        Team: true
      }
    });
    res.json(playerTeams);
  } catch (error) {
    console.error('Error fetching player-team relationships:', error);
    res.status(500).json({ error: 'Failed to fetch player-team relationships' });
  }
};

// Get player-team relationship by ID
export const getPlayerTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const playerTeam = await prisma.player_Team.findUnique({
      where: { id: parseInt(id) },
      include: {
        Player: true,
        Team: true
      }
    });
    
    if (!playerTeam) {
      return res.status(404).json({ error: 'Player-team relationship not found' });
    }
    
    res.json(playerTeam);
  } catch (error) {
    console.error(`Error fetching player-team relationship with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch player-team relationship' });
  }
};

// Get teams by player ID
export const getTeamsByPlayerId = async (req: Request, res: Response) => {
  const { playerId } = req.params;
  
  try {
    const playerTeams = await prisma.player_Team.findMany({
      where: { playerId: parseInt(playerId) },
      include: {
        Team: true
      },
      orderBy: {
        start_date: 'desc'
      }
    });
    
    res.json(playerTeams);
  } catch (error) {
    console.error(`Error fetching teams for player ID ${playerId}:`, error);
    res.status(500).json({ error: 'Failed to fetch teams for player' });
  }
};

// Get players by team ID
export const getPlayersByTeamId = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  
  try {
    const playerTeams = await prisma.player_Team.findMany({
      where: { teamId: parseInt(teamId) },
      include: {
        Player: true
      }
    });
    
    res.json(playerTeams);
  } catch (error) {
    console.error(`Error fetching players for team ID ${teamId}:`, error);
    res.status(500).json({ error: 'Failed to fetch players for team' });
  }
};

// Get current teams for player
export const getCurrentTeamByPlayerId = async (req: Request, res: Response) => {
  const { playerId } = req.params;
  
  try {
    const currentTeam = await prisma.player_Team.findFirst({
      where: { 
        playerId: parseInt(playerId),
        current_team: true
      },
      include: {
        Team: true
      }
    });
    
    if (!currentTeam) {
      return res.status(404).json({ error: 'No current team found for player' });
    }
    
    res.json(currentTeam);
  } catch (error) {
    console.error(`Error fetching current team for player ID ${playerId}:`, error);
    res.status(500).json({ error: 'Failed to fetch current team for player' });
  }
};

// Create new player-team relationship
export const createPlayerTeam = async (req: Request, res: Response) => {
  const playerTeamData: PlayerTeamCreateInput = req.body;
  try {
    const newPlayerAward = await prisma.player_Award.create({
      data: playerTeamData
    });
    
    res.status(201).json(newPlayerAward);
  } catch (error) {
    console.error('Error creating player award:', error);
    res.status(400).json({ error: 'Failed to create player award' });
  }

  /*
  try {
    // If this is marked as current_team, update any existing current team records for this player
    if (playerTeamData.current_team) {
      await prisma.player_Team.updateMany({
        where: {
          playerId: playerTeamData.playerId as number,
          current_team: true
        },
        data: {
          current_team: false,
          end_date: new Date()
        }
      });
    }
    
    const newPlayerTeam = await prisma.player_Team.create({
      data: playerTeamData
    });
    
    res.status(201).json(newPlayerTeam);
  } catch (error) {
    console.error('Error creating player-team relationship:', error);
    res.status(400).json({ error: 'Failed to create player-team relationship' });
  }
    */
};

// Update player-team relationship
export const updatePlayerTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const playerTeamData: PlayerTeamUpdateInput = req.body;
  
  try {
    // If this is being updated to be the current team, update any existing current team records
    if (playerTeamData.current_team === true) {
      const currentPlayerTeam = await prisma.player_Team.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (currentPlayerTeam) {
        await prisma.player_Team.updateMany({
          where: {
            playerId: currentPlayerTeam.playerId,
            current_team: true,
            id: {
              not: parseInt(id)
            }
          },
          data: {
            current_team: false,
            end_date: new Date()
          }
        });
      }
    }
    
    const updatedPlayerTeam = await prisma.player_Team.update({
      where: { id: parseInt(id) },
      data: playerTeamData
    });
    
    res.json(updatedPlayerTeam);
  } catch (error) {
    console.error(`Error updating player-team relationship with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Player-team relationship not found' });
    }
    
    res.status(400).json({ error: 'Failed to update player-team relationship' });
  }
};

// Delete player-team relationship
export const deletePlayerTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.player_Team.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting player-team relationship with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Player-team relationship not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete player-team relationship' });
  }
};