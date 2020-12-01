import { storage } from '@guardian/libs';
import {
    getUserFromApiWithRefreshedCookie,
    isUserLoggedIn,
} from 'common/modules/identity/api';

const shouldRefreshCookie = (
    lastRefresh: number | null | undefined,
    currentTime: number
): boolean => {
    const days30k = 1000 * 86400 * 30; // (as seconds)
    return !lastRefresh || currentTime > parseInt(lastRefresh, 10) + days30k;
};

const init = (): void => {
    const lastRefreshKey = 'identity.lastRefresh';

    if (storage.local.isAvailable() && isUserLoggedIn()) {
        const currentTime = new Date().getTime();
        const lastRefresh = storage.local.get(lastRefreshKey);
        if (shouldRefreshCookie(lastRefresh, currentTime)) {
            getUserFromApiWithRefreshedCookie();
            storage.local.set(lastRefreshKey, currentTime);
        }
    }
};

export { shouldRefreshCookie, init };
