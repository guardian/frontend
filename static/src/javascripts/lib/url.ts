import { memoize } from 'lodash-es';
import { hasPushStateSupport } from './detect';

// TODO: typescript detect.js
const supportsPushState = hasPushStateSupport() as boolean;

/**
 * Commercial Testing Instrument
 *
 * Returns a map { <bidderName>: true } of bidders
 * according to the pbtest URL parameter
 */
const pbTestNameMap: () => Record<string, true | undefined> = memoize(
	(): Record<string, undefined | true> =>
		new URLSearchParams(window.location.search)
			.getAll('pbtest')
			.reduce<Record<string, undefined | true>>((acc, value) => {
				acc[value] = true;
				return acc;
			}, {}),
	(): string =>
		// Same implicit parameter as the memoized function
		window.location.search,
);

const STARTING_QUESTION_MARK = /^\?/;
/**
 * @returns `"foo=bar&fizz=buzz"` (i.e. no `?` symbol)
 */
const getCurrentQueryString = (): string =>
	window.location.search.replace(STARTING_QUESTION_MARK, '');

type QueryStringMap = Record<
	string | number | symbol,
	string | true | undefined
>;

const queryStringToUrlVars = memoize(
	(queryString: string): QueryStringMap =>
		Array.from(new URLSearchParams(queryString).entries()) // polyfill.io guarantees URLSearchParams
			.reduce<QueryStringMap>((acc, [key, value]) => {
				acc[key] = value === '' ? true : value;
				return acc;
			}, {}),
);

/**
 * returns a map of querystrings
 * eg ?foo=bar&fizz=buzz returns {foo: 'bar', fizz: 'buzz'}
 * ?foo=bar&foo=baz returns {foo: 'baz'}
 * ?foo returns { foo: true }
 */
const getUrlVars = (query?: string): QueryStringMap =>
	queryStringToUrlVars(query ?? window.location.search);

type Params = {
	querystring?: string;
	title?: string;
	[x: string]: unknown;
};
const updateQueryString = (params: Params, historyFn: History['pushState']) => {
	const querystringChanged = getCurrentQueryString() !== params.querystring;

	if (params.querystring && querystringChanged && supportsPushState) {
		historyFn(
			params.state || {},
			params.title ?? document.title,
			params.querystring + window.location.hash,
		);
	}
};

/**
 * this will replace anything after the root/domain of the URL
 * and add an item to the browser history.
 * params Object requires a "querystring" property
 * and optionally takes a "state" and "title" property too
 */
const pushQueryString = (params: Params): void =>
	updateQueryString(params, window.history.pushState.bind(window.history));
/**
 * equivalent to pushQueryString but uses history.replaceState to
 * overwrite history rather than history.pushState
 */
const replaceQueryString = (params: Params): void =>
	updateQueryString(params, window.history.replaceState.bind(window.history));

export type MaybeArray<T> = T | T[];
/**
 * Turn an object into a query parameter string
 *
 * e.g. `{page: 1, pageSize: 10}` => `"page=1&pageSize=10"`
 *
 * Note that `Array` value parameters will turn into
 * `param=value1,value2`
 * as opposed to
 * `param=value1&param=value2`
 */
const constructQuery = (
	query: Record<string, MaybeArray<string | number | boolean>>,
): string =>
	Object.keys(query)
		.map((param) => {
			const value = query[param];
			const queryValue = Array.isArray(value)
				? value.map((v) => encodeURIComponent(v)).join(',')
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
	state: Record<string, unknown>,
	title: string,
	url: string,
	replace = false,
): void => {
	if (supportsPushState) {
		window.history[replace ? 'replaceState' : 'pushState'](
			state,
			title,
			url,
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
	supportsPushState, // this is identical to the one in detect.js, expect its never undefined
	pushQueryString,
	replaceQueryString,
	pbTestNameMap,
};
