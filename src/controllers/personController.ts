import { Request, Response } from 'express';
import { prisma } from '../server';
import { PersonCreateInput, PersonUpdateInput } from '../types';

// Get all persons
export const getAllPersons = async (req: Request, res: Response) => {
  try {
    const persons = await prisma.person.findMany();
    res.json(persons);
  } catch (error) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ error: 'Failed to fetch persons' });
  }
};

// Get person by ID
export const getPersonById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const person = await prisma.person.findUnique({
      where: { pid: parseInt(id) }
    });
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    console.error(`Error fetching person with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
};

// Get person by username
export const getPersonByUsername = async (req: Request, res: Response) => {
  const { username } = req.params;
  
  try {
    const person = await prisma.person.findFirst({
      where: { userName: username }
    });
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    console.error(`Error fetching person with username ${username}:`, error);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
};

// Get person by email
export const getPersonByEmail = async (req: Request, res: Response) => {
  const { email } = req.params;
  
  try {
    const person = await prisma.person.findFirst({
      where: { emailAddress: email }
    });
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    console.error(`Error fetching person with email ${email}:`, error);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
};

// Create new person
export const createPerson = async (req: Request, res: Response) => {
  const personData: PersonCreateInput = req.body;
  
  try {
    // Check if username already exists
    const existingUsername = await prisma.person.findFirst({
      where: { userName: personData.userName }
    });
    
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await prisma.person.findFirst({
      where: { emailAddress: personData.emailAddress }
    });
    
    if (existingEmail) {
      return res.status(400).json({ error: 'Email address already exists' });
    }
    
    const newPerson = await prisma.person.create({
      data: personData
    });
    
    res.status(201).json(newPerson);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(400).json({ error: 'Failed to create person' });
  }
};

// Update person
export const updatePerson = async (req: Request, res: Response) => {
  const { id } = req.params;
  const personData: PersonUpdateInput = req.body;
  
  try {
    // Check if email is being updated and if it already exists
    if (personData.emailAddress) {
      const existingEmail = await prisma.person.findFirst({
        where: {
          emailAddress: personData.emailAddress as string,
          pid: {
            not: parseInt(id)
          }
        }
      });
      
      if (existingEmail) {
        return res.status(400).json({ error: 'Email address already exists' });
      }
    }
    
    // Check if username is being updated and if it already exists
    if (personData.userName) {
      const existingUsername = await prisma.person.findFirst({
        where: {
          userName: personData.userName as string,
          pid: {
            not: parseInt(id)
          }
        }
      });
      
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }
    
    const updatedPerson = await prisma.person.update({
      where: { pid: parseInt(id) },
      data: personData
    });
    
    res.json(updatedPerson);
  } catch (error) {
    console.error(`Error updating person with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.status(400).json({ error: 'Failed to update person' });
  }
};

// Delete person
export const deletePerson = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.person.delete({
      where: { pid: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting person with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete person' });
  }
};

// Authenticate person (login)
export const authenticatePerson = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    const person = await prisma.person.findFirst({
      where: {
        userName: username,
        password: password
      }
    });
    
    if (!person) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For a real application, you should use proper authentication with JWT or sessions
    // This is a simplified example
    res.json({
      message: 'Authentication successful',
      user: {
        id: person.pid,
        username: person.userName,
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.emailAddress
      }
    });
  } catch (error) {
    console.error('Error authenticating person:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};