// @flow

import {
    isUserLoggedIn,
    getUserFromApiWithRefreshedCookie,
} from 'common/modules/identity/api';
import { local as localStorage } from 'lib/storage';

const shouldRefreshCookie = (
    lastRefresh: ?number,
    currentTime: number
): boolean => {
    const days30k = 1000 * 86400 * 30; // (as seconds)
    return !lastRefresh || currentTime > parseInt(lastRefresh, 10) + days30k;
};

const init = (): void => {
    const lastRefreshKey = 'identity.lastRefresh';

    if (localStorage.isAvailable() && isUserLoggedIn()) {
        const currentTime = new Date().getTime();
        const lastRefresh = localStorage.get(lastRefreshKey);
        if (shouldRefreshCookie(lastRefresh, currentTime)) {
            getUserFromApiWithRefreshedCookie();
            localStorage.set(lastRefreshKey, currentTime);
        }
    }
};

export { shouldRefreshCookie, init };
