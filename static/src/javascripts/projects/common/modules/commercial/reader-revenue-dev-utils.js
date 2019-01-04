// @flow

import { removeCookie } from 'lib/cookies';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { readerRevenueRelevantCookies } from 'common/modules/commercial/user-features';
import { clearViewLog as clearEpicViewLog } from 'common/modules/commercial/acquisitions-view-log';
import {
    clearBannerHistory,
    minArticlesBeforeShowingBanner,
} from 'common/modules/commercial/membership-engagement-banner';
import { local } from 'lib/storage';
import {
    initMvtCookie,
    decrementMvtCookie,
    incrementMvtCookie,
} from 'common/modules/analytics/mvt-cookie';
import { setGeolocation, getSync as geolocationGetSync } from 'lib/geolocation';
import { clearOverrides as clearAbTestOverrides } from 'common/modules/experiments/ab-overrides';

const clearCommonReaderRevenueStateAndReload = (): void => {
    readerRevenueRelevantCookies.forEach(cookie => removeCookie(cookie));

    initMvtCookie();
    clearAbTestOverrides();

    // Most versions of the epic only display for a certain number of pageviews in
    // a given time window (typically, 4 per 30 days).
    // We always want to clear out this view log, since otherwise this
    // reload might mean the epic no longer appears on the next page view.
    clearEpicViewLog();

    if (isUserLoggedIn()) {
        if (window.location.origin.includes('localhost')) {
            // Assume they don't have identity running locally
            // So try and remove the identity cookie manually
            removeCookie('GU_U');
        } else {
            const profileUrl = window.location.origin.replace(
                /(www\.|m\.)/,
                'profile.'
            );
            window.location.assign(`${profileUrl}/signout`);
        }
    } else {
        window.location.reload();
    }
};

const showMeTheEpic = (): void => {
    // Clearing out the epic view log happens before all reloads
    clearCommonReaderRevenueStateAndReload();
};

const showMeTheBanner = (): void => {
    clearBannerHistory();

    // The banner only displays after a certain number of pageviews. So let's get there quick!
    local.set('gu.alreadyVisited', minArticlesBeforeShowingBanner + 1);
    clearCommonReaderRevenueStateAndReload();
};

// For the below functions, assume the user can currently see the thing
// they want to display. So we don't clear out the banner history since
// we don't necessarily want the banner popping up if someone's working
// with the epic.
const showNextVariant = (): void => {
    incrementMvtCookie();
    clearCommonReaderRevenueStateAndReload();
};

const showPreviousVariant = (): void => {
    decrementMvtCookie();
    clearCommonReaderRevenueStateAndReload();
};

const changeGeolocation = (): void => {
    const geo = window.prompt(
        `Enter two-letter geolocation code (e.g. GB, US, AU). Current is ${geolocationGetSync()}.`
    );
    setGeolocation(geo);
    clearCommonReaderRevenueStateAndReload();
};

export const init = (): void => {
    // Expose functions so they can be called on the console and within bookmarklets
    window.guardian.readerRevenue = {
        showMeTheEpic,
        showMeTheBanner,
        showNextVariant,
        showPreviousVariant,
        changeGeolocation,
    };
};
