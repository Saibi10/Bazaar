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

// Get current user (from token)
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

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select('-password'); // Exclude the password field
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// Update user by ID
const updateUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        console.log("Update request body:", req.body);

        const updates = req.body;

        // Handle password change if included
        if (updates.newPassword) {
            console.log("Password change requested");

            // Verify current password
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (!updates.currentPassword) {
                return res.status(400).json({ message: 'Current password is required' });
            }

            try {
                const isMatch = await user.comparePassword(updates.currentPassword);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Current password is incorrect' });
                }

                // Set new password
                user.password = updates.newPassword;
                console.log("New password set, saving...");
                await user.save();
                console.log("Password updated successfully");

            } catch (passwordError) {
                console.error("Password verification error:", passwordError);
                return res.status(400).json({ message: 'Password verification failed', error: passwordError.message });
            }

            // Remove password fields from updates object
            delete updates.currentPassword;
            delete updates.newPassword;
        }

        // Only proceed with other updates if there are any fields left to update
        let updatedUser;

        if (Object.keys(updates).length > 0) {
            console.log("Updating other fields:", Object.keys(updates));

            // Update other fields
            updatedUser = await User.findByIdAndUpdate(
                userId,
                updates,
                { new: true, runValidators: true }
            ).select('-password');

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found during update' });
            }
        } else {
            // If only password was updated, we need to fetch the user again
            updatedUser = await User.findById(userId).select('-password');
        }

        console.log("User updated successfully");
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// Delete user by ID
const deleteUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
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

module.exports = { createUser, getUser, loginUser, getUserById, updateUserById, deleteUserById };