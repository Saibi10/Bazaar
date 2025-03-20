const express = require('express');
const { createAddress, getUserAddresses, updateAddress, deleteAddress } = require('../controllers/addressController');

const router = express.Router();

// POST /addresses - Create a new address
router.post('/', createAddress);
// GET /addresses/:userId - Get all addresses for a user
router.get('/:userId', getUserAddresses);
// PUT /addresses/:addressId - Update an address
router.put('/:addressId', updateAddress);
// DELETE /addresses/:addressId - Delete an address
router.delete('/:addressId', deleteAddress);

module.exports = router;