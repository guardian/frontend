// @flow

import storages from 'lib/storage';

const IO = [
    {
        key: 'test-1',
        data: 'string',
        expected: '{"value":"string"}',
        options: {},
    },

    {
        key: 'test-2',
        data: { foo: 'bar' },
        expected: '{"value":{"foo":"bar"}}',
        options: {},
    },

    {
        key: 'test-3',
        data: [true, 2, 'bar'],
        expected: '{"value":[true,2,"bar"]}',
        options: {},
    },

    {
        key: 'test-4',
        data: 'test-4',
        options: {
            expires: new Date('2100-01-01'),
        },
        expected: '{"value":"test-4","expires":"2100-01-01T00:00:00.000Z"}',
    },

    {
        key: 'test-5',
        data: false,
        expected: '{"value":false}',
        options: {},
    },
];

describe('storage', () => {
    ['session', 'local'].forEach(storageType => {
        const engine = storages[storageType];

        beforeAll(() => {
            // jsdom doesn't support localStorage/ sessionStorage
            window[`${storageType}Storage`] = {
                getItem: jest.fn(key => {
                    const item = IO.find(io => io.key === key);
                    return item && item.expected;
                }),
                setItem: jest.fn(),
                removeItem: jest.fn(),
            };

            engine.storage = window[`${storageType}Storage`];
        });

        beforeEach(() => {
            engine.available = true;
        });

        test(`${storageType} - isAvailable()`, () => {
            engine.available = undefined;
            expect(engine.isAvailable()).toBe(true);
            expect(engine.available).toBe(true);
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

        test(`${storageType} - isAvailable() cache`, () => {
            // not available, if setItem fails
            engine.available = false;
            expect(engine.isAvailable()).toBe(false);
        });

        test(`${storageType} - set()`, () => {
            IO.forEach(({ key, data, expected, options }) => {
                engine.storage.setItem.mockClear();
                engine.set(key, data, options);
                expect(engine.storage.setItem).toHaveBeenCalledWith(
                    key,
                    expected
                );
            });
        });

        test(`${storageType} - get()`, () => {
            IO.forEach(({ key, data }) => {
                expect(engine.get(key)).toEqual(data);
            });
        });

        test(`${storageType} - get() with expired item`, () => {
            IO.filter(
                item => item.options && item.options.expires
            ).forEach(expired => {
                const { key } = expired;
                const OriginalDate = global.Date;

                global.Date = jest.fn(
                    dateString => new OriginalDate(dateString || '2100-01-02')
                );

                expect(engine.get(key)).toEqual(null);
                expect(engine.storage.removeItem).toHaveBeenCalledWith(key);
                engine.storage.removeItem.mockClear();

                global.Date = OriginalDate;
            });
        });

        test(`${storageType} - get() with non-expired item`, () => {
            IO.filter(
                item => item.options && item.options.expires
            ).forEach(expired => {
                const { key, data } = expired;
                const OriginalDate = global.Date;

                global.Date = jest.fn(
                    dateString => new OriginalDate(dateString || '2099-01-01')
                );

                expect(engine.get(key)).toEqual(data);
                expect(engine.storage.removeItem).not.toHaveBeenCalled();
                engine.storage.removeItem.mockClear();

                global.Date = OriginalDate;
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
