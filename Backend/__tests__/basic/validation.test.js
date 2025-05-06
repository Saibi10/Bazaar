// Simple validation utility functions
const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isPasswordStrong = (password) => {
    return password.length >= 8;
};

const isPhoneNumberValid = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
};

const isNameValid = (name) => {
    return name.length > 0 && name.length <= 50;
};

const isAgeValid = (age) => {
    return age >= 18 && age <= 120;
};

describe('Validation Function Tests', () => {
    test('validates email correctly', () => {
        expect(isEmailValid('test@example.com')).toBe(true);
        expect(isEmailValid('invalid-email')).toBe(false);
        expect(isEmailValid('test@.com')).toBe(false);
    });

    test('validates password strength correctly', () => {
        expect(isPasswordStrong('strongpassword')).toBe(true);
        expect(isPasswordStrong('weak')).toBe(false);
    });

    test('validates phone number correctly', () => {
        expect(isPhoneNumberValid('1234567890')).toBe(true);
        expect(isPhoneNumberValid('123456')).toBe(false);
        expect(isPhoneNumberValid('123-456-7890')).toBe(false);
    });

    test('validates name correctly', () => {
        expect(isNameValid('John')).toBe(true);
        expect(isNameValid('')).toBe(false);
        expect(isNameValid('A'.repeat(51))).toBe(false);
    });

    test('validates age correctly', () => {
        expect(isAgeValid(25)).toBe(true);
        expect(isAgeValid(17)).toBe(false);
        expect(isAgeValid(121)).toBe(false);
    });
}); 