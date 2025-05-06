const Address = require('../../models/Address');
const User = require('../../models/User');
const {
    createAddress,
    getUserAddresses,
    getAddressById,
    updateAddressById,
    deleteAddressById
} = require('../../controllers/addressController');
const mongoose = require('mongoose');
require('../setup');

// Mock Express request and response objects
const mockRequest = (body = {}, params = {}, userId = null) => {
    const req = { body, params };
    if (userId) req.userId = userId;
    return req;
};

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Address Controller Tests', () => {
    let userId;

    beforeEach(async () => {
        // Create test user
        const user = new User({
            name: 'Address Test User',
            username: 'addresstestuser',
            email: 'addresstest@example.com',
            password: 'addresspassword123'
        });
        await user.save();
        userId = user._id;
    });

    test('createAddress should create a new address', async () => {
        const req = mockRequest({
            name: 'Home Address',
            phoneNumber: '1234567890',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country',
            isDefault: true,
            type: 'home'
        }, {}, userId);

        const res = mockResponse();

        await createAddress(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.any(String),
                address: expect.objectContaining({
                    user: userId,
                    addressLine1: '123 Test St',
                    city: 'Test City',
                    isDefault: true
                })
            })
        );

        // Verify address was created in DB
        const addresses = await Address.find({ user: userId });
        expect(addresses.length).toBe(1);
    });

    test('getUserAddresses should fetch all addresses for a user', async () => {
        // Create test addresses
        await Address.create([
            {
                user: userId,
                name: 'Home Address',
                phoneNumber: '1234567890',
                addressLine1: '123 First St',
                city: 'First City',
                state: 'First State',
                postalCode: '12345',
                country: 'First Country',
                isDefault: true,
                type: 'home'
            },
            {
                user: userId,
                name: 'Work Address',
                phoneNumber: '0987654321',
                addressLine1: '456 Second St',
                city: 'Second City',
                state: 'Second State',
                postalCode: '67890',
                country: 'Second Country',
                isDefault: false,
                type: 'work'
            }
        ]);

        const req = mockRequest({}, {}, userId);
        const res = mockResponse();

        await getUserAddresses(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    user: userId,
                    addressLine1: '123 First St',
                    city: 'First City',
                    isDefault: true
                }),
                expect.objectContaining({
                    user: userId,
                    addressLine1: '456 Second St',
                    city: 'Second City',
                    isDefault: false
                })
            ])
        );
    });

    test('deleteAddressById should delete an address', async () => {
        // Create test address
        const address = await Address.create({
            user: userId,
            name: 'Delete Address',
            phoneNumber: '5555555555',
            addressLine1: '123 Delete St',
            city: 'Delete City',
            state: 'Delete State',
            postalCode: '12345',
            country: 'Delete Country',
            isDefault: true,
            type: 'home'
        });

        const req = mockRequest({}, { id: address._id }, userId);
        const res = mockResponse();

        await deleteAddressById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('deleted')
            })
        );

        // Verify address was deleted from DB
        const deletedAddress = await Address.findById(address._id);
        expect(deletedAddress).toBeNull();
    });
}); 