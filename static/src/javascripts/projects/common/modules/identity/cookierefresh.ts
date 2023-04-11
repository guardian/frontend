import { storage } from '@guardian/libs';
import {
	isUserLoggedIn,
	refreshOktaSession,
} from 'common/modules/identity/api';

const days30InMillis: number = 1000 * 60 * 60 * 24 * 30;

const shouldRefreshCookie: (
	lastRefresh: unknown | null,
	currentTime: number,
) => boolean = (lastRefresh: unknown | null, currentTime: number) => {
	// !!Number() returns false for false, null, undefined, 0, and non-numeric strings.
	// We do this because lastRefresh can be any type or value and we only want to proceed with
	// the rest of the check if it's a number.
	const lastRefreshIsValid = !!Number(lastRefresh);
	if (!lastRefreshIsValid) {
		// We should refresh if we don't have a valid lastRefresh value.
		return true;
	}

	// We should refresh if the lastRefresh value is older than 30 days.
	return currentTime - Number(lastRefresh) > days30InMillis;
};

const init: () => void = () => {
	const lastRefreshKey = 'identity.lastRefresh';
	if (storage.local.isAvailable() && isUserLoggedIn()) {
		const currentTime: number = new Date().getTime();
		// The storage API could return any type handled by JSON.parse, so
		// we will assume the type is 'unknown' and attempt to parse the value into
		// a number in the shouldRefreshCookie function.
		// storage.local.get will return null in two cases: if the key is missing,
		// or if the value has expired.
		const lastRefresh: unknown | null = storage.local.get(lastRefreshKey);
		if (shouldRefreshCookie(lastRefresh, currentTime)) {
			// Set the value in localStorage to expire in 30 days.
			const newExpiry = currentTime + days30InMillis;
			storage.local.set(lastRefreshKey, currentTime, newExpiry);
			// we only refresh the okta session, users with only an IDAPI session will
			// eventually be logged out by the IDAPI cookie expiry
			refreshOktaSession(encodeURIComponent(document.location.href));
		}
	}
};

export { shouldRefreshCookie, init };
