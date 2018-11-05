// @flow

import { hasPushStateSupport } from 'lib/detect';
import memoize from 'lodash/memoize';

const supportsPushState = hasPushStateSupport();

/* commercial testing instrument */
// Returns a map { <bidderName>: true } of bidders
// according to the pbtest URL parameter

const pbTestNameMap: () => { [string]: boolean } = memoize(
    (): { [string]: boolean } =>
        new URLSearchParams(window.location.search)
            .getAll('pbtest')
            .reduce((acc, value) => {
                acc[value] = true;
                return acc;
            }, {}),
    (): string =>
        // Same implicit parameter as the memoized function
        window.location.search
);

// returns "foo=bar&fizz=buzz" (eg. no ? symbol)
const getCurrentQueryString = (): string =>
    window.location.search.replace(/^\?/, '');

const queryStringToUrlVars = memoize(
    (queryString: string): Object =>
        Array.from(new URLSearchParams(queryString).entries()) // polyfill.io guarantees URLSearchParams
            .reduce((acc, [key, value]) => {
                acc[key] = value === '' ? true : value;
                return acc;
            }, {})
);

// returns a map of querystrings
// eg ?foo=bar&fizz=buzz returns {foo: 'bar', fizz: 'buzz'}
// ?foo=bar&foo=baz returns {foo: 'baz'}
// ?foo returns { foo: true }
const getUrlVars = (query?: string): Object =>
    queryStringToUrlVars(query || window.location.search);

const updateQueryString = (params: Object, historyFn: Function) => {
    const querystringChanged = getCurrentQueryString() !== params.querystring;

    if (params.querystring && querystringChanged && supportsPushState) {
        historyFn(
            params.state || {},
            params.title || window.title,
            params.querystring + window.location.hash
        );
    }
};

// this will replace anything after the root/domain of the URL
// and add an item to the browser history.
// params Object requires a "querystring" property
// and optionally takes a "state" and "title" property too
const pushQueryString = (params: Object) =>
    updateQueryString(params, window.history.pushState.bind(window.history));

// equivalent to pushQueryString but uses history.replaceState to
// overwrite history rather than history.pushState
const replaceQueryString = (params: Object) =>
    updateQueryString(params, window.history.replaceState.bind(window.history));

// take an Object, construct into a query, e.g. {page: 1, pageSize: 10} => page=1&pageSize=10
// Note that Array value parameters will turn into param=value1,value2 as opposed to param=value1&param=value2
const constructQuery = (query: Object): string =>
    Object.keys(query)
        .map(param => {
            const value = query[param];
            const queryValue = Array.isArray(value)
                ? value.map(v => encodeURIComponent(v)).join(',')
                : encodeURIComponent(value);
            return `${param}=${queryValue}`;
        })
        .join('&');

const getPath = (url: string): string => {
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    return a.pathname;
};

const pushUrl = (
    state: Object,
    title: string,
    url: string,
    replace?: boolean = false
): void => {
    if (supportsPushState) {
        window.history[replace ? 'replaceState' : 'pushState'](
            state,
            title,
            url
        );
    }
};

const back = (): void => {
    if (supportsPushState) {
        window.history.back();
    }
};

export {
    getUrlVars,
    getPath,
    pushUrl,
    constructQuery,
    back,
    supportsPushState,
    pushQueryString,
    replaceQueryString,
    pbTestNameMap,
};
