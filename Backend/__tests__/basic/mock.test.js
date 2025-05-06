describe('Mock Function Tests', () => {
    test('mock function is called correctly', () => {
        const mockFn = jest.fn();
        mockFn();
        expect(mockFn).toHaveBeenCalled();
    });

    test('mock function is called with the right arguments', () => {
        const mockFn = jest.fn();
        mockFn('hello', 'world');
        expect(mockFn).toHaveBeenCalledWith('hello', 'world');
    });

    test('mock function is called the right number of times', () => {
        const mockFn = jest.fn();
        mockFn();
        mockFn();
        mockFn();
        expect(mockFn).toHaveBeenCalledTimes(3);
    });

    test('mock function can return a value', () => {
        const mockFn = jest.fn().mockReturnValue('mocked value');
        const result = mockFn();
        expect(result).toBe('mocked value');
    });

    test('mock function can implement custom behavior', () => {
        const mockFn = jest.fn(x => x * 2);
        expect(mockFn(5)).toBe(10);
        expect(mockFn(10)).toBe(20);
    });
}); 