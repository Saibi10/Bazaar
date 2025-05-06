describe('Number Tests', () => {
    test('addition works correctly', () => {
        expect(1 + 2).toBe(3);
    });

    test('subtraction works correctly', () => {
        expect(5 - 3).toBe(2);
    });

    test('multiplication works correctly', () => {
        expect(4 * 5).toBe(20);
    });

    test('division works correctly', () => {
        expect(10 / 2).toBe(5);
    });

    test('modulus operation works correctly', () => {
        expect(10 % 3).toBe(1);
    });
}); 