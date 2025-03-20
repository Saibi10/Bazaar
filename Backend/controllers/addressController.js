const Address = require('../models/Address');
const User = require('../models/User');

// Create a new address for a user
const createAddress = async (req, res) => {
    try {
        const { userId, type, name, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

        // Create the address
        const address = new Address({
            user: userId,
            type,
            name,
            phoneNumber,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            isDefault,
        });
        await address.save();

        // Add the address to the user's addresses array
        const user = await User.findById(userId);
        user.addresses.push(address._id);
        await user.save();

        res.status(201).json({ message: 'Address created successfully', address });
    } catch (error) {
        res.status(400).json({ message: 'Error creating address', error: error.message });
    }
};

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
    try {
        const { userId } = req.params;
        const addresses = await Address.find({ user: userId });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching addresses', error: error.message });
    }
};

// Update an address
const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const updateData = req.body;

        const address = await Address.findByIdAndUpdate(addressId, updateData, { new: true });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address updated successfully', address });
    } catch (error) {
        res.status(400).json({ message: 'Error updating address', error: error.message });
    }
};

// Delete an address
const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        // Remove the address from the user's addresses array
        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const user = await User.findById(address.user);
        user.addresses.pull(addressId);
        await user.save();

        // Delete the address
        await Address.findByIdAndDelete(addressId);

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting address', error: error.message });
    }
};

module.exports = { createAddress, getUserAddresses, updateAddress, deleteAddress };