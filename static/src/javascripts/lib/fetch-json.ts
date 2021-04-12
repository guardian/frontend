import config_ from 'lib/config';
import fetch from 'lib/fetch';

// This is really a hacky workaround ⚠️
const config = config_ as {
	get: (s: string, d?: string) => string;
};

const fetchJson = async (
	resource: string,
	init: RequestInit = {},
): Promise<unknown> => {
	if (typeof resource !== 'string')
		throw new Error('First argument should be of type `string`');

	let path = resource;
	if (!RegExp('^(https?:)?//').exec(resource)) {
		// If `resource` is not relative url
		path = String(config.get('page.ajaxUrl', '')) + resource;
		init.mode = 'cors';
		init.credentials = 'include';
	}

	const resp = (await fetch(path, init)) as Response;
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
