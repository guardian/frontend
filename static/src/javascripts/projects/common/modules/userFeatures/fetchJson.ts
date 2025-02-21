export const fetchJson = async (
	path: string,
	init: RequestInit = {},
): Promise<unknown> => {
	const resp = await fetch(path, init);
	if (resp.ok) {
		try {
			return resp.json();
		} catch (ex) {
			throw new Error(
				`Fetch error while requesting ${path}: Invalid JSON response`,
			);
		}
	}
	throw new Error(`Fetch error while requesting ${path}: ${resp.statusText}`);
};
