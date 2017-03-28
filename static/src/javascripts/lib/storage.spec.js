// @flow

/* eslint no-useless-escape: 0 */

import storages from 'lib/storage';

const IO = [
    {
        key: 'test-1',
        data: 'string',
        expected: '{\"value\":\"string\"}',
    },

    {
        key: 'test-2',
        data: { foo: 'bar' },
        expected: '{\"value\":{\"foo\":\"bar\"}}',
    },

    {
        key: 'test-3',
        data: [true, 2, 'bar'],
        expected: '{\"value\":[true,2,\"bar\"]}',
    },

    {
        key: 'test-4',
        data: 'test-4',
        options: {
            expires: new Date('2100-01-01'),
        },
        expected: '{\"value\":\"test-4\",\"expires\":\"2100-01-01T00:00:00.000Z\"}',
    },

    {
        key: 'test-5',
        data: false,
        expected: '{\"value\":false}',
    }
];

describe('storage', () => {
    ['session', 'local'].forEach(storageType => {
        const engine = storages[storageType];

        beforeEach(() => {
            window[`${storageType}Storage`] = {
                getItem: jest.fn(key => IO.find(item => item.key === key).expected),
                setItem: jest.fn(),
                removeItem: jest.fn(),
            };

            engine.storage = window[`${storageType}Storage`];
            engine.available = true;
        });

        test(`${storageType} - isAvailable()`, () => {
            engine.available = undefined;
            expect(engine.isAvailable()).toBe(true);
            expect(engine.storage.setItem).toHaveBeenCalledWith(
                'local-storage-module-test',
                'graun'
            );
        });

        test(`${storageType} - is(Not)Available()`, () => {
            const origSet = engine.storage.setItem;

            // not available, if setItem fails
            engine.available = undefined;
            engine.storage.setItem = () => {
                throw new Error('Problem!');
            };
            expect(engine.isAvailable()).toBe(false);

            engine.storage.setItem = origSet;
        });

        test(`${storageType} - set()`, () => {
            IO.forEach(({ key, data, expected, options = {} }) => {
                engine.storage.setItem.mockClear();
                engine.set(key, data, options);
                expect(engine.storage.setItem).toHaveBeenCalledWith(key, expected);
            });
        });

        test(`${storageType} - get()`, () => {
            IO.forEach(({ key, data }) => {
                expect(engine.get(key)).toEqual(data);
            });
        });

        test(`${storageType} - getRaw()`, () => {
            IO.forEach(({ key, expected }) => {
                expect(engine.getRaw(key)).toBe(expected);
            });
        });

        test(`${storageType} - remove()`, () => {
            IO.forEach(({ key }) => {
                engine.storage.removeItem.mockClear();
                engine.remove(key);
                expect(engine.storage.removeItem).toHaveBeenCalledWith(key);
            });
        });
    });
});
