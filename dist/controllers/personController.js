"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatePerson = exports.deletePerson = exports.updatePerson = exports.createPerson = exports.getPersonByEmail = exports.getPersonByUsername = exports.getPersonById = exports.getAllPersons = void 0;
const server_1 = require("../server");
// Get all persons
const getAllPersons = async (req, res) => {
    try {
        const persons = await server_1.prisma.person.findMany();
        res.json(persons);
    }
    catch (error) {
        console.error('Error fetching persons:', error);
        res.status(500).json({ error: 'Failed to fetch persons' });
    }
};
exports.getAllPersons = getAllPersons;
// Get person by ID
const getPersonById = async (req, res) => {
    const { id } = req.params;
    try {
        const person = await server_1.prisma.person.findUnique({
            where: { pid: parseInt(id) }
        });
        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }
        res.json(person);
    }
    catch (error) {
        console.error(`Error fetching person with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch person' });
    }
};
exports.getPersonById = getPersonById;
// Get person by username
const getPersonByUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const person = await server_1.prisma.person.findFirst({
            where: { userName: username }
        });
        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }
        res.json(person);
    }
    catch (error) {
        console.error(`Error fetching person with username ${username}:`, error);
        res.status(500).json({ error: 'Failed to fetch person' });
    }
};
exports.getPersonByUsername = getPersonByUsername;
// Get person by email
const getPersonByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const person = await server_1.prisma.person.findFirst({
            where: { emailAddress: email }
        });
        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }
        res.json(person);
    }
    catch (error) {
        console.error(`Error fetching person with email ${email}:`, error);
        res.status(500).json({ error: 'Failed to fetch person' });
    }
};
exports.getPersonByEmail = getPersonByEmail;
// Create new person
const createPerson = async (req, res) => {
    const personData = req.body;
    try {
        // Check if username already exists
        const existingUsername = await server_1.prisma.person.findFirst({
            where: { userName: personData.userName }
        });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        // Check if email already exists
        const existingEmail = await server_1.prisma.person.findFirst({
            where: { emailAddress: personData.emailAddress }
        });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email address already exists' });
        }
        const newPerson = await server_1.prisma.person.create({
            data: personData
        });
        res.status(201).json(newPerson);
    }
    catch (error) {
        console.error('Error creating person:', error);
        res.status(400).json({ error: 'Failed to create person' });
    }
};
exports.createPerson = createPerson;
// Update person
const updatePerson = async (req, res) => {
    const { id } = req.params;
    const personData = req.body;
    try {
        // Check if email is being updated and if it already exists
        if (personData.emailAddress) {
            const existingEmail = await server_1.prisma.person.findFirst({
                where: {
                    emailAddress: personData.emailAddress,
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
            const existingUsername = await server_1.prisma.person.findFirst({
                where: {
                    userName: personData.userName,
                    pid: {
                        not: parseInt(id)
                    }
                }
            });
            if (existingUsername) {
                return res.status(400).json({ error: 'Username already exists' });
            }
        }
        const updatedPerson = await server_1.prisma.person.update({
            where: { pid: parseInt(id) },
            data: personData
        });
        res.json(updatedPerson);
    }
    catch (error) {
        console.error(`Error updating person with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return res.status(404).json({ error: 'Person not found' });
        }
        res.status(400).json({ error: 'Failed to update person' });
    }
};
exports.updatePerson = updatePerson;
// Delete person
const deletePerson = async (req, res) => {
    const { id } = req.params;
    try {
        await server_1.prisma.person.delete({
            where: { pid: parseInt(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting person with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Person not found' });
        }
        res.status(500).json({ error: 'Failed to delete person' });
    }
};
exports.deletePerson = deletePerson;
// Authenticate person (login)
const authenticatePerson = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const person = await server_1.prisma.person.findFirst({
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
    }
    catch (error) {
        console.error('Error authenticating person:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.authenticatePerson = authenticatePerson;
