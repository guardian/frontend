// @flow

import url from './url';

jest.mock('lib/detect', () => ({
    hasPushStateSupport: () => true,
}));

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

    test('getPath() - should return a path', () => {
        const HOST = 'http://host.com';
        const QUERIES = [
            [`${HOST}/foo/bar/baz`, '/foo/bar/baz'],
            [`${HOST}/foo?foo=bar`, '/foo'],
            [`${HOST}/foo#foo`, '/foo'],
        ];

        QUERIES.forEach(dataProvider => {
            const [query, expected] = dataProvider;
            expect(url.getPath(query)).toEqual(expected);
        });
    });

    test('back() - should go one page back in history', () => {
        const origBack = window.history.back;
        window.history.back = jest.fn();

        expect(window.history.back).toHaveBeenCalled();

        window.history.back = origBack;
    });
});
