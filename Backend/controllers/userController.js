const User = require('../models/user');

// Create a new user
const createUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        const user = new User({ name, username, email, password });
        await user.save();
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error: error.message });
    }
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

module.exports = { createUser, getUsers };