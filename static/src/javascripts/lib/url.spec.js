// @flow

import {
    getUrlVars,
    getPath,
    pushUrl,
    constructQuery,
    back,
    pushQueryString,
    replaceQueryString,
} from './url';

jest.mock('lib/detect', () => ({
    hasPushStateSupport() {
        return true;
    },
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
        QUERIES.forEach(([query, expected]) => {
            expect(getUrlVars(query)).toEqual(expected);
        });

        // get the query from window.location.search
        QUERIES.forEach(([query, expected]) => {
            Object.defineProperty(window.location, 'search', {
                writable: true,
                value: `?${query}`,
            });

            expect(getUrlVars()).toEqual(expected);
        });

        window.location.search = origWindowSearch;
    });

    test('constructQuery() - should be able to construct query', () => {
        [
            [{ foo: true }, 'foo=true'],
            [{ foo: 'bar', bar: true }, 'foo=bar&bar=true'],
            [{ foo: 'bar' }, 'foo=bar'],
            [{ foo: 'bar', boo: 'far' }, 'foo=bar&boo=far'],
            [{ foo: ['bar1', 'bar2'], boo: 'far' }, 'foo=bar1,bar2&boo=far'],
            [{}, ''],
        ].forEach(([vars, expected]) => {
            expect(constructQuery(vars)).toEqual(expected);
        });
    });

    test('getPath() - should return a path', () => {
        const HOST = 'http://host.com';
        const QUERIES = [
            [`${HOST}/foo/bar/baz`, '/foo/bar/baz'],
            [`${HOST}/foo?foo=bar`, '/foo'],
            [`${HOST}/foo#foo`, '/foo'],
        ];

        QUERIES.forEach(([query, expected]) => {
            expect(getPath(query)).toEqual(expected);
        });
    });

    test('back() - should go one page back in history', () => {
        const origBack = window.history.back;
        window.history.back = jest.fn();

        back();
        expect(window.history.back).toHaveBeenCalled();

        window.history.back = origBack;
    });

    test('pushUrl() - should either replace or push the new state', () => {
        const origReplace = window.history.replaceState;
        const origPush = window.history.pushState;
        const state = { foo: 'bar' };
        const title = 'new-state-title';
        const path = '/foo/bar';

        window.history.replaceState = jest.fn();
        window.history.pushState = jest.fn();

        // push
        pushUrl(state, title, path);
        expect(window.history.pushState).toHaveBeenCalledWith(
            state,
            title,
            path
        );
        expect(window.history.replaceState).not.toHaveBeenCalled();

        // replace
        window.history.replaceState.mockClear();
        window.history.pushState.mockClear();

        pushUrl(state, title, path, true);
        expect(window.history.pushState).not.toHaveBeenCalled();
        expect(window.history.replaceState).toHaveBeenCalledWith(
            state,
            title,
            path
        );

        window.history.replaceState = origReplace;
        window.history.pushState = origPush;
    });

    const testQueryString = (historyMethod, moduleMethod) => {
        const origWindowSearch = window.location.search;
        const origMethod = window.history[historyMethod];
        const title = 'new-state-title';
        const querystring = '/foo/bar';
        const state = { foo: 'bar' };

        window.history[historyMethod] = jest.fn();
        window.title = title;

        moduleMethod({ state, querystring, title });
        expect(window.history[historyMethod]).toHaveBeenCalledWith(
            state,
            title,
            querystring
        );

        window.history[historyMethod].mockClear();
        moduleMethod({ querystring });
        expect(window.history[historyMethod]).toHaveBeenCalledWith(
            {},
            title,
            querystring
        );

        Object.defineProperty(window.location, 'search', {
            writable: true,
            value: `?${querystring}`,
        });

        window.history[historyMethod].mockClear();
        moduleMethod({ querystring });
        expect(window.history[historyMethod]).not.toHaveBeenCalled();

        window.history[historyMethod] = origMethod;
        window.location.search = origWindowSearch;
    };

    test('pushQueryString()', () => {
        testQueryString('pushState', pushQueryString);
    });

    test('replaceQueryString()', () => {
        testQueryString('replaceState', replaceQueryString);
    });
});
