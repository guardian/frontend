import { storage } from '@guardian/libs';
import {
	getUserFromApiWithRefreshedCookie,
	isUserLoggedIn,
	refreshOktaSession,
} from 'common/modules/identity/api';

const days30InMillis: number = 1000 * 60 * 60 * 24 * 30;

const shouldRefreshCookie: (
	lastRefresh: string | null,
	currentTime: number,
) => boolean = (lastRefresh: string | null, currentTime: number) => {
	// Cookies auto-refresh after 30 days
	return (
		!lastRefresh || currentTime - parseInt(lastRefresh, 10) > days30InMillis
	);
};

const safelyGet = (value: unknown) => {
	switch (typeof value) {
		case 'string':
			return value;
		default:
			return null;
	}
};

const init: () => void = () => {
	const lastRefreshKey = 'identity.lastRefresh';

	if (storage.local.isAvailable() && isUserLoggedIn()) {
		const currentTime: number = new Date().getTime();
		const lastRefresh: string | null = safelyGet(
			storage.local.get(lastRefreshKey),
		);
		if (shouldRefreshCookie(lastRefresh, currentTime)) {
			getUserFromApiWithRefreshedCookie().catch(() => {
				/* do nothing */
			});
			storage.local.set(lastRefreshKey, currentTime);
			refreshOktaSession(encodeURIComponent(document.location.href));
		}
	}
};

export { shouldRefreshCookie, init };
