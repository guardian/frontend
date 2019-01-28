// @flow

import { removeCookie } from 'lib/cookies';
import { isUserLoggedIn } from 'common/modules/identity/api';
import {
    fakeOneOffContributor,
    readerRevenueRelevantCookies,
} from 'common/modules/commercial/user-features';
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
import { clearParticipations } from 'common/modules/experiments/ab-local-storage';

const clearCommonReaderRevenueStateAndReload = (
    asExistingSupporter: boolean
): void => {
    readerRevenueRelevantCookies.forEach(cookie => removeCookie(cookie));

    initMvtCookie();
    clearParticipations();

    // Most versions of the epic only display for a certain number of pageviews in
    // a given time window (typically, 4 per 30 days).
    // We always want to clear out this view log, since otherwise this
    // reload might mean the epic no longer appears on the next page view.
    clearEpicViewLog();

    if (asExistingSupporter) {
        // We use the one-off contributions cookie since the others
        // get updated based on AJAX calls.
        // This mechanism will break when start sending data on one-off contributions
        // from the members-data-api and updating cookies based on that.
        fakeOneOffContributor();
    }

    if (isUserLoggedIn() && !asExistingSupporter) {
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

const showMeTheEpic = (asExistingSupporter: boolean = false): void => {
    // Clearing out the epic view log happens before all reloads
    clearCommonReaderRevenueStateAndReload(asExistingSupporter);
};

const showMeTheBanner = (asExistingSupporter: boolean = false): void => {
    clearBannerHistory();

    // The banner only displays after a certain number of pageviews. So let's get there quick!
    local.set('gu.alreadyVisited', minArticlesBeforeShowingBanner + 1);
    clearCommonReaderRevenueStateAndReload(asExistingSupporter);
};

// For the below functions, assume the user can currently see the thing
// they want to display. So we don't clear out the banner history since
// we don't necessarily want the banner popping up if someone's working
// with the epic.
const showNextVariant = (asExistingSupporter: boolean = false): void => {
    incrementMvtCookie();
    clearCommonReaderRevenueStateAndReload(asExistingSupporter);
};

const showPreviousVariant = (asExistingSupporter: boolean = false): void => {
    decrementMvtCookie();
    clearCommonReaderRevenueStateAndReload(asExistingSupporter);
};

const changeGeolocation = (asExistingSupporter: boolean = false): void => {
    const geo = window.prompt(
        `Enter two-letter geolocation code (e.g. GB, US, AU). Current is ${geolocationGetSync()}.`
    );
    if (geo) {
        setGeolocation(geo);
        clearCommonReaderRevenueStateAndReload(asExistingSupporter);
    }
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
