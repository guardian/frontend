/* global jsdom */

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

const originalLocation = window.location;

describe('url', () => {
    beforeEach(() => {
        delete window.location;
        window.location = Object.defineProperties(
            {},
            {
                ...Object.getOwnPropertyDescriptors(originalLocation),
                assign: {
                    configurable: true,
                    value: (url) => jsdom.reconfigure({ url }),
                },
            },
        );
    });

    test('getUrlVars() - should get url vars', () => {
        const origWindowLocation = window.location.href;
        const QUERIES = [
            ['foo', { foo: true }],
            ['?foo', { foo: true }],
            ['?foo=bar', { foo: 'bar' }],
            ['foo=bar&foo=baz', { foo: 'baz' }], // Last value wins
            ['?foo=bar&boo=far', { foo: 'bar', boo: 'far' }],
            ['foo=bar&boo=far&foo=baz', { foo: 'baz', boo: 'far' }],
            ['?foo=bar&boo=far&', { foo: 'bar', boo: 'far' }],
            ['foo=bar&boo', { foo: 'bar', boo: true }],
            ['boo=&foo=bar', { foo: 'bar', boo: true }],
            ['name=J%C3%A9r%C3%B4me', { name: 'Jérôme' }],
            ['', {}],
        ];

        // pass in the query
        QUERIES.forEach(([query, expected]) => {
            expect(getUrlVars(query)).toEqual(expected);
        });

        // get the query from window.location.search
        QUERIES.forEach(([query, expected]) => {
            const preQuery = window.location.href.split('?')[0];
            const cleanQuery = query.replace(/^\?/, '');
            window.location.assign(`${preQuery}?${cleanQuery}`);
            expect(getUrlVars()).toEqual(expected);
        });

        window.location.assign(origWindowLocation);
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
        const origWindowLocation = window.location.href;

        const origMethod = window.history[historyMethod];
        const title = 'new-state-title';
        const querystring = '/foo/bar';
        const state = { foo: 'bar' };

        window.history[historyMethod] = jest.fn();
        document.title = title;

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

        window.history[historyMethod] = origMethod;
        window.location.assign(origWindowLocation);
    };

    test('pushQueryString()', () => {
        testQueryString('pushState', pushQueryString);
    });

    test('replaceQueryString()', () => {
        testQueryString('replaceState', replaceQueryString);
    });
});
