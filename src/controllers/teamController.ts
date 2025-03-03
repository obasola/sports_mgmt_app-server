import { Request, Response } from 'express';
import { prisma } from '../server';
import { TeamCreateInput, TeamUpdateInput } from '../types';

// Get all teams
export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
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
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

// Get team by ID
export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const team = await prisma.team.findUnique({
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
  } catch (error) {
    console.error(`Error fetching team with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

// Create new team
export const createTeam = async (req: Request, res: Response) => {
  const teamData: TeamCreateInput = req.body;
  
  try {
    const newTeam = await prisma.team.create({
      data: teamData
    });
    
    res.status(201).json(newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(400).json({ error: 'Failed to create team' });
  }
};

// Update team
export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const teamData: TeamUpdateInput = req.body;
  
  try {
    const updatedTeam = await prisma.team.update({
      where: { id: parseInt(id) },
      data: teamData
    });
    
    res.json(updatedTeam);
  } catch (error) {
    console.error(`Error updating team with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.status(400).json({ error: 'Failed to update team' });
  }
};

// Delete team
export const deleteTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.team.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting team with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete team' });
  }
};

// Get teams by conference
export const getTeamsByConference = async (req: Request, res: Response) => {
  const { conference } = req.params;
  
  try {
    const teams = await prisma.team.findMany({
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
  } catch (error) {
    console.error(`Error fetching teams in conference ${conference}:`, error);
    res.status(500).json({ error: 'Failed to fetch teams by conference' });
  }
};

// Get teams by division
export const getTeamsByDivision = async (req: Request, res: Response) => {
  const { division } = req.params;
  
  try {
    const teams = await prisma.team.findMany({
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
  } catch (error) {
    console.error(`Error fetching teams in division ${division}:`, error);
    res.status(500).json({ error: 'Failed to fetch teams by division' });
  }
};