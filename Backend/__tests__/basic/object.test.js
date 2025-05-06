describe('Object Tests', () => {
    test('object properties can be accessed and modified', () => {
        const obj = { name: 'John', age: 30 };
        expect(obj.name).toBe('John');

        obj.name = 'Jane';
        expect(obj.name).toBe('Jane');
    });

    test('object keys can be enumerated', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const keys = Object.keys(obj);
        expect(keys).toEqual(['a', 'b', 'c']);
    });

    test('object values can be extracted', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const values = Object.values(obj);
        expect(values).toEqual([1, 2, 3]);
    });

    test('objects can be spread', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { c: 3, d: 4 };
        const combined = { ...obj1, ...obj2 };
        expect(combined).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    test('object entries provides key-value pairs', () => {
        const obj = { a: 1, b: 2 };
        const entries = Object.entries(obj);
        expect(entries).toEqual([['a', 1], ['b', 2]]);
    });
}); 