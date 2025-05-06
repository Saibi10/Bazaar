describe('Array Tests', () => {
    test('array push adds elements correctly', () => {
        const arr = [1, 2, 3];
        arr.push(4);
        expect(arr).toEqual([1, 2, 3, 4]);
    });

    test('array pop removes the last element', () => {
        const arr = [1, 2, 3, 4];
        const popped = arr.pop();
        expect(popped).toBe(4);
        expect(arr).toEqual([1, 2, 3]);
    });

    test('array map transforms elements correctly', () => {
        const arr = [1, 2, 3];
        const doubled = arr.map(num => num * 2);
        expect(doubled).toEqual([2, 4, 6]);
    });

    test('array filter works correctly', () => {
        const arr = [1, 2, 3, 4, 5];
        const even = arr.filter(num => num % 2 === 0);
        expect(even).toEqual([2, 4]);
    });

    test('array includes checks for element existence', () => {
        const arr = [1, 2, 3];
        expect(arr.includes(2)).toBe(true);
        expect(arr.includes(5)).toBe(false);
    });
}); 