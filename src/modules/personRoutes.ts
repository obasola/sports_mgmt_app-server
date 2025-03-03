import express from 'express';
import {
  getAllPersons,
  getPersonById,
  getPersonByUsername,
  getPersonByEmail,
  createPerson,
  updatePerson,
  deletePerson,
  authenticatePerson
} from '../controllers/personController';

const router = express.Router();

// GET /api/persons - Get all persons
router.get('/', getAllPersons);

// GET /api/persons/:id - Get person by ID
router.get('/:id', getPersonById);

// GET /api/persons/username/:username - Get person by username
router.get('/username/:username', getPersonByUsername);

// GET /api/persons/email/:email - Get person by email
router.get('/email/:email', getPersonByEmail);

// POST /api/persons - Create new person
router.post('/', createPerson);

// PUT /api/persons/:id - Update person
router.put('/:id', updatePerson);

// DELETE /api/persons/:id - Delete person
router.delete('/:id', deletePerson);

// POST /api/persons/login - Authenticate person (login)
router.post('/login', authenticatePerson);

export default router;