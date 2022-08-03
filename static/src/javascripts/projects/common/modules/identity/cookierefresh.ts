import {
	isUserLoggedIn,
	getUserFromApiWithRefreshedCookie,
	refreshOktaSession,
} from 'common/modules/identity/api';
import { storage } from '@guardian/libs';

const days30InMillis: number = 1000 * 60 * 60 * 24 * 30;

const shouldRefreshCookie: (
	lastRefresh: any,
	currentTime: number,
) => boolean = (lastRefresh: any, currentTime: number) => {
	// Cookies auto-refresh after 30 days
	return (
		!lastRefresh || currentTime - parseInt(lastRefresh, 10) > days30InMillis
	);
};

const init: () => void = () => {
	const lastRefreshKey = 'identity.lastRefresh';

	if (storage.local.isAvailable() && isUserLoggedIn()) {
		const currentTime = new Date().getTime();
		const lastRefresh = storage.local.get(lastRefreshKey);
		if (shouldRefreshCookie(lastRefresh, currentTime)) {
			getUserFromApiWithRefreshedCookie();
			storage.local.set(lastRefreshKey, currentTime);
			refreshOktaSession(encodeURIComponent(document.location.href));
		}
	}
};

export { shouldRefreshCookie, init };
