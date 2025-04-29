const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwtUtils');

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
const getUser = async (req, res) => {
    try {
        console.log("Requesting User");
        // Fetch the user by ID (attached to the request object by authMiddleware)
        const user = await User.findById(req.userId).select('-password'); // Exclude the password field
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user details
        res.status(200).json({ message: 'User fetched successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// Login a single user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = generateToken(user._id);

        // Login successful
        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

module.exports = { createUser, getUser, loginUser };