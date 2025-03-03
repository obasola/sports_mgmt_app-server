"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const personController_1 = require("../controllers/personController");
const router = express_1.default.Router();
// GET /api/persons - Get all persons
router.get('/', personController_1.getAllPersons);
// GET /api/persons/:id - Get person by ID
router.get('/:id', personController_1.getPersonById);
// GET /api/persons/username/:username - Get person by username
router.get('/username/:username', personController_1.getPersonByUsername);
// GET /api/persons/email/:email - Get person by email
router.get('/email/:email', personController_1.getPersonByEmail);
// POST /api/persons - Create new person
router.post('/', personController_1.createPerson);
// PUT /api/persons/:id - Update person
router.put('/:id', personController_1.updatePerson);
// DELETE /api/persons/:id - Delete person
router.delete('/:id', personController_1.deletePerson);
// POST /api/persons/login - Authenticate person (login)
router.post('/login', personController_1.authenticatePerson);
exports.default = router;
