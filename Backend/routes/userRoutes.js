const express = require('express');
const { createUser, getUser, loginUser, getUserById, updateUserById, deleteUserById } = require('../controllers/userController');
const authMiddleware = require('../config/authMiddleware');

const router = express.Router();

// POST /users - Create a new user
router.post('/create', createUser);
// POST /users/login - Login a user
router.post('/login', loginUser);
// GET /users/me - Get current user profile (this still needs auth)
router.get('/me', authMiddleware, getUser);

// Routes without authentication
// GET /users/:id - Get a specific user by ID
router.get('/:id', getUserById);
// PUT /users/:id - Update a user
router.put('/:id', updateUserById);
// DELETE /users/:id - Delete a user
router.delete('/:id', deleteUserById);

module.exports = router;