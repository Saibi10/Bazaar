const express = require('express');
const { createUser, getUsers, loginUser } = require('../controllers/userController');

const router = express.Router();

// POST /users - Create a new user
router.post('/create', createUser);

// POST /users/login - Login a user
router.post('/login', loginUser);

// GET /users - Get all users
router.get('/', getUsers);

module.exports = router;