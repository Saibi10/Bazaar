const express = require('express');
const { createUser, getUsers } = require('../controllers/userController');

const router = express.Router();

// POST /users - Create a new user
router.post('/create-user', createUser);

// GET /users - Get all users
router.get('/users', getUsers);

module.exports = router;