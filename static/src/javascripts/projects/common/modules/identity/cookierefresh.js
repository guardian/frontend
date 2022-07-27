import {
	isUserLoggedIn,
	getUserFromApiWithRefreshedCookie,
	refreshOktaSession,
} from 'common/modules/identity/api';
import { storage } from '@guardian/libs';

const shouldRefreshCookie = (lastRefresh, currentTime) => {
	const days30InSeconds = 1000 * 86400 * 30; // (as seconds)
	return (
		!lastRefresh ||
		currentTime > parseInt(lastRefresh, 10) + days30InSeconds
	);
};

const init = () => {
	const lastRefreshKey = 'identity.lastRefresh';

	if (storage.local.isAvailable() && isUserLoggedIn()) {
		const currentTime = new Date().getTime();
		const lastRefresh = storage.local.get(lastRefreshKey);
		if (shouldRefreshCookie(lastRefresh, currentTime)) {
			getUserFromApiWithRefreshedCookie();
			refreshOktaSession(encodeURIComponent(document.location.href));
			storage.local.set(lastRefreshKey, currentTime);
		}
	}
};

export { shouldRefreshCookie, init };
