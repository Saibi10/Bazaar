describe('String Tests', () => {
    test('string concatenation works correctly', () => {
        expect('hello' + ' ' + 'world').toBe('hello world');
    });

    test('string length calculation is correct', () => {
        expect('hello world'.length).toBe(11);
    });

    test('string uppercase transformation works', () => {
        expect('hello'.toUpperCase()).toBe('HELLO');
    });

    test('string substring extraction works', () => {
        expect('hello world'.substring(0, 5)).toBe('hello');
    });
}); 