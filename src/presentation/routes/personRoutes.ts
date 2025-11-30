// src/presentation/routes/personRoutes.ts
import { Router } from 'express';
import { PersonController } from '../controllers/PersonController';
import { PersonService } from '@/application/person/services/PersonService';
import { PrismaPersonRepository } from '@/infrastructure/repositories/PrismaPersonRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreatePersonDtoSchema,
  UpdatePersonDtoSchema,
  PersonFiltersDtoSchema,
  PersonSearchDtoSchema,
  LoginDtoSchema,
  PaginationDtoSchema,
} from '@/application/person/dto/PersonDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const personRepository = new PrismaPersonRepository();
const personService = new PersonService(personRepository);
const personController = new PersonController(personService);

// Parameter validation schemas
const PidParamsSchema = z.object({
  pid: z.string().regex(/^\d+$/, 'PID must be a number').transform(Number),
});

const UserNameParamsSchema = z.object({
  userName: z.string().min(1, 'Username is required').max(25, 'Username cannot exceed 25 characters'),
});

const EmailParamsSchema = z.object({
  emailAddress: z.string().email('Invalid email format'),
});

const QuerySchema = PersonFiltersDtoSchema.merge(PaginationDtoSchema);
const SearchQuerySchema = PersonSearchDtoSchema.merge(PaginationDtoSchema);

// Authentication routes
router.post(
  '/login',
  validateBody(LoginDtoSchema),
  personController.login
);

// CRUD routes
router.post(
  '/',
  validateBody(CreatePersonDtoSchema),
  personController.createPerson
);

router.get(
  '/',
  validateQuery(QuerySchema),
  personController.getAllPersons
);

router.get(
  '/search',
  validateQuery(SearchQuerySchema),
  personController.searchByUserName
);

router.get(
  '/:pid',
  validateParams(PidParamsSchema),
  personController.getPersonById
);

router.get(
  '/username/:userName',
  validateParams(UserNameParamsSchema),
  personController.getPersonByUserName
);

router.get(
  '/email/:emailAddress',
  validateParams(EmailParamsSchema),
  personController.getPersonByEmailAddress
);

// Existence check routes
router.get(
  '/:pid/exists',
  validateParams(PidParamsSchema),
  personController.checkPersonExists
);

router.get(
  '/username/:userName/exists',
  validateParams(UserNameParamsSchema),
  personController.checkUserNameExists
);

router.get(
  '/email/:emailAddress/exists',
  validateParams(EmailParamsSchema),
  personController.checkEmailExists
);

router.put(
  '/:pid',
  validateParams(PidParamsSchema),
  validateBody(UpdatePersonDtoSchema),
  personController.updatePerson
);

router.delete(
  '/:pid',
  validateParams(PidParamsSchema),
  personController.deletePerson
);

export { router as personRoutes };