import config from './config';

/**
 * Check that path is a path-absolute-URL string as described in https://url.spec.whatwg.org/#path-absolute-url-string
 * A path-absolute-URL string is U+002F (/) followed by a path-relative-URL string, for instance `/plop` or `/plop/plop`
 */
function isPathAbsoluteURL(path: string): boolean {
	return !RegExp('^(https?:)?//').exec(path);
}

const fetchJson = async (
	resource: string,
	init: RequestInit = {},
): Promise<unknown> => {
	if (typeof resource !== 'string')
		throw new Error('First argument should be of type `string`');

	let path = resource;
	if (isPathAbsoluteURL(path)) {
		path = config.get<string>('page.ajaxUrl', '') + resource;
		init.mode = 'cors';
	}

	const resp = await fetch(path, init);
	if (resp.ok) {
		switch (resp.status) {
			case 204:
				return {};
			default:
				try {
					return resp.json();
				} catch (ex) {
					throw new Error(
						`Fetch error while requesting ${path}: Invalid JSON response`,
					);
				}
		}
	}
	throw new Error(`Fetch error while requesting ${path}: ${resp.statusText}`);
};

export { fetchJson };
