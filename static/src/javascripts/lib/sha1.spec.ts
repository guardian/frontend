import sha1 from './sha1';

const TABLE = [
    ['A cryptographic hash', 'de6094f2e556845db1529b5f42c72b2985bf6393'],
    ['integrity verification', 'b8ff2e013132a20fc79b145d65377f5325c500ff'],
    ['password storage', '7495b1e3fe2662663e5557790ec33c227db2386d'],
];

describe('SHA1', () => {
    test('hash()', () => {
        TABLE.forEach((pair) => {
            const [text, hash] = pair;
            expect(sha1.hash(text)).toBe(hash);
        });
    });
});
