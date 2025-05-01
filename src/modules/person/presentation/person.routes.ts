import { Router } from 'express';
import { PersonController } from './person.controller';
import { PersonService } from '../application/person.service';
import { PersonPrismaRepository } from '../infrastructure/persistence/person.prisma.repository';

// Initialize dependencies
const personRepository = new PersonPrismaRepository();
const personService = new PersonService(personRepository);
const personController = new PersonController(personService);

// Create router
const personRouter = Router();

// Define routes
personRouter.get('/', (req, res) => personController.getAllPersons(req, res));
personRouter.get('/:pid', (req, res) => personController.getPersonById(req, res));
personRouter.post('/', (req, res) => personController.createPerson(req, res));
personRouter.put('/:pid', (req, res) => personController.updatePerson(req, res));
personRouter.put('/:pid/password', (req, res) => personController.updatePassword(req, res));
personRouter.delete('/:pid', (req, res) => personController.deletePerson(req, res));
personRouter.post('/authenticate', (req, res) => personController.authenticate(req, res));

export default personRouter;
