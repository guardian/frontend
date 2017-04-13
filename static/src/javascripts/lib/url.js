// @flow

import detect from 'lib/detect';

const supportsPushState = detect.hasPushStateSupport();

// returns "foo=bar&fizz=buzz" (eg. no ? symbol)
const getCurrentQueryString = (): string =>
    window.location.search.replace(/^\?/, '');

// returns a map of querystrings
// eg ?foo=bar&fizz=buzz returns {foo: 'bar', fizz: 'buzz'}
const getUrlVars = (query?: string): Object =>
    (query || getCurrentQueryString())
        .split('&')
        .filter(Boolean)
        .map(param => param.includes('=') ? param.split('=') : [param, true])
        .reduce(
            (acc, input) => {
                const result = acc;
                result[input[0]] = input[1];
                return result;
            },
            {}
        );

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
    updateQueryString(params, history.pushState.bind(history));

// equivalent to pushQueryString but uses history.replaceState to
// overwrite history rather than history.pushState
const replaceQueryString = (params: Object) =>
    updateQueryString(params, history.replaceState.bind(history));

// take an Object, construct into a query, e.g. {page: 1, pageSize: 10} => page=1&pageSize=10
const constructQuery = (query: Object): string =>
    Object.keys(query)
        .map(param => {
            const value = query[param];
            const queryValue = Array.isArray(value) ? value.join(',') : value;
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
};
