import { Request, Response } from 'express';
import { PersonService } from '../application/person.service';
import {
  CreatePersonDto,
  CreatePersonSchema,
  UpdatePersonDto,
  UpdatePersonSchema,
  UpdatePasswordDto,
  UpdatePasswordSchema,
  AuthenticateDto,
  AuthenticateSchema,
  mapPersonToDto,
} from '../application/dtos/person.dto';
import { ZodError } from 'zod';

export class PersonController {
  private readonly personService: PersonService;

  constructor(personService: PersonService) {
    this.personService = personService;
  }

  /**
   * Get a person by id
   */
  async getPersonById(req: Request, res: Response): Promise<void> {
    const pid = parseInt(req.params.pid, 10);

    if (isNaN(pid)) {
      res.status(400).json({ error: 'Invalid person ID' });
      return;
    }

    const result = await this.personService.getPersonById(pid);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const person = result.getValue();

    if (!person) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }

    res.status(200).json(mapPersonToDto(person));
  }

  /**
   * Get all persons with optional pagination
   */
  async getAllPersons(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    if ((limit !== undefined && isNaN(limit)) || (offset !== undefined && isNaN(offset))) {
      res.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    const result = await this.personService.getAllPersons(limit, offset);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const persons = result.getValue();
    const personDtos = persons.map(mapPersonToDto);

    res.status(200).json(personDtos);
  }

  /**
   * Create a new person
   */
  async createPerson(req: Request, res: Response): Promise<void> {
    try {
      const personData: CreatePersonDto = CreatePersonSchema.parse(req.body);
      const result = await this.personService.createPerson(personData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const createdPerson = result.getValue();
      res.status(201).json(mapPersonToDto(createdPerson));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to create person', details: (error as Error).message });
      }
    }
  }

  /**
   * Update an existing person
   */
  async updatePerson(req: Request, res: Response): Promise<void> {
    try {
      const pid = parseInt(req.params.pid, 10);

      if (isNaN(pid)) {
        res.status(400).json({ error: 'Invalid person ID' });
        return;
      }

      const personData: UpdatePersonDto = UpdatePersonSchema.parse(req.body);
      const result = await this.personService.updatePerson(pid, personData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedPerson = result.getValue();
      res.status(200).json(mapPersonToDto(updatedPerson));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to update person', details: (error as Error).message });
      }
    }
  }

  /**
   * Update person's password
   */
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const pid = parseInt(req.params.pid, 10);

      if (isNaN(pid)) {
        res.status(400).json({ error: 'Invalid person ID' });
        return;
      }

      const passwordData: UpdatePasswordDto = UpdatePasswordSchema.parse(req.body);

      // Verify current password
      const personResult = await this.personService.getPersonById(pid);

      if (personResult.isFailure) {
        res.status(500).json({ error: personResult.error });
        return;
      }

      const person = personResult.getValue();

      if (!person) {
        res.status(404).json({ error: 'Person not found' });
        return;
      }

      // Authenticate with current password
      const authResult = await this.personService.authenticatePerson(
        person.userName,
        passwordData.currentPassword,
      );

      if (authResult.isFailure) {
        res.status(500).json({ error: authResult.error });
        return;
      }

      const authenticated = authResult.getValue();

      if (!authenticated) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      // Update the password
      const result = await this.personService.updatePassword(pid, passwordData.newPassword);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedPerson = result.getValue();
      res.status(200).json(mapPersonToDto(updatedPerson));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to update password', details: (error as Error).message });
      }
    }
  }

  /**
   * Delete a person
   */
  async deletePerson(req: Request, res: Response): Promise<void> {
    const pid = parseInt(req.params.pid, 10);

    if (isNaN(pid)) {
      res.status(400).json({ error: 'Invalid person ID' });
      return;
    }

    const result = await this.personService.deletePerson(pid);

    if (result.isFailure) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(204).send();
  }

  /**
   * Authenticate a person
   */
  async authenticate(req: Request, res: Response): Promise<void> {
    try {
      const authData: AuthenticateDto = AuthenticateSchema.parse(req.body);
      const result = await this.personService.authenticatePerson(
        authData.userName,
        authData.password,
      );

      if (result.isFailure) {
        res.status(500).json({ error: result.error });
        return;
      }

      const person = result.getValue();

      if (!person) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      // In a real application, this would be where you would generate and return a JWT token
      res.status(200).json({
        message: 'Authentication successful',
        user: mapPersonToDto(person),
        // token: 'JWT-TOKEN-WOULD-GO-HERE'
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to authenticate', details: (error as Error).message });
      }
    }
  }
}
