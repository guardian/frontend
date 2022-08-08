import { storage } from '@guardian/libs';
import {
	getUserFromApiWithRefreshedCookie,
	isUserLoggedIn,
	refreshOktaSession,
} from 'common/modules/identity/api';

const days30InMillis: number = 1000 * 60 * 60 * 24 * 30;

const shouldRefreshCookie: (
	lastRefresh: unknown | null,
	currentTime: number,
) => boolean = (lastRefresh: unknown | null, currentTime: number) => {
	// The cookie should be refreshed in two cases:
	// 1) There is no last refresh value, or it's falsy
	// 2) The last refresh value is older than 30 days.
	// We cast the lastRefresh value to a string, then parse it as an integer
	// because we don't know what type it might be.
	return (
		!lastRefresh ||
		currentTime - parseInt(String(lastRefresh), 10) > days30InMillis
	);
};

const init: () => void = async () => {
	const lastRefreshKey = 'identity.lastRefresh';

	if (storage.local.isAvailable() && isUserLoggedIn()) {
		const currentTime: number = new Date().getTime();
		// The storage API could return any type handled by JSON.parse, so
		// we will assume the type is 'any' and always parse the value into
		// an integer.
		// TODO: Rewrite this to make use of the storage API's built-in
		// expiry mechanism: https://github.com/guardian/frontend/pull/25306#discussion_r937843037
		const lastRefresh: unknown | null = storage.local.get(lastRefreshKey);
		if (shouldRefreshCookie(lastRefresh, currentTime)) {
			await getUserFromApiWithRefreshedCookie();
			storage.local.set(lastRefreshKey, currentTime);
			refreshOktaSession(encodeURIComponent(document.location.href));
		}
	}
};

export { shouldRefreshCookie, init };
