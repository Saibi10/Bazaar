describe('Async Tests', () => {
    test('resolves with correct value', async () => {
        const promise = Promise.resolve('success');
        await expect(promise).resolves.toBe('success');
    });

    test('async/await works correctly', async () => {
        const getData = async () => 'data';
        const result = await getData();
        expect(result).toBe('data');
    });

    test('Promise.all resolves all promises', async () => {
        const promises = [
            Promise.resolve(1),
            Promise.resolve(2),
            Promise.resolve(3)
        ];

        const results = await Promise.all(promises);
        expect(results).toEqual([1, 2, 3]);
    });

    test('setTimeout works with promises', async () => {
        const delayedValue = () => {
            return new Promise(resolve => {
                setTimeout(() => resolve('delayed'), 100);
            });
        };

        const result = await delayedValue();
        expect(result).toBe('delayed');
    });
}); 