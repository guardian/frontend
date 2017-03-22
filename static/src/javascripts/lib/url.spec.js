// @flow

import url from './url';

describe('url', () => {
    test('getUrlVars() - should get url vars', () => {
        const origWindowSearch = window.location.search;
        const QUERIES = [
            ['foo', { foo: true }],
            ['foo=bar', { foo: 'bar' }],
            ['foo=bar&boo=far', { foo: 'bar', boo: 'far' }],
            ['foo=bar&boo=far&', { foo: 'bar', boo: 'far' }],
            ['foo=bar&boo', { foo: 'bar', boo: true }],
            ['', {}],
        ];

        // pass in the query
        QUERIES.forEach(dataProvider => {
            const [query, expected] = dataProvider;
            expect(url.getUrlVars({ query })).toEqual(expected);
        });

        // set query on window.location.search
        QUERIES.forEach(dataProvider => {
            const [query, expected] = dataProvider;

            window.location.search = `?${query}`;
            expect(url.getUrlVars()).toEqual(expected);
        });

        window.location.search = origWindowSearch;
    });

    test('constructQuery() - should be able to construct query', () => {
        [
            [{ foo: true }, 'foo'],
            [{ foo: 'bar', bar: true }, 'foo=bar&bar'],
            [{ foo: 'bar' }, 'foo=bar'],
            [{ foo: 'bar', boo: 'far' }, 'foo=bar&boo=far'],
            [{ foo: ['bar1', 'bar2'], boo: 'far' }, 'foo=bar1,bar2&boo=far'],
            [{}, ''],
        ].forEach(dataProvider => {
            const [vars, expected] = dataProvider;
            expect(url.constructQuery(vars)).toEqual(expected);
        });
    });
});
