const express = require('express');
const { createUser, getUser, loginUser } = require('../controllers/userController');
const authMiddleware = require('../config/authMiddleware');

const router = express.Router();

// POST /users - Create a new user
router.post('/create', createUser);
// POST /users/login - Login a user
router.post('/login', loginUser);
// GET /users - Get all users
router.get('/me', authMiddleware, getUser);

module.exports = router;