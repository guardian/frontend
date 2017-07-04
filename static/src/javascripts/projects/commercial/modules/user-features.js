// @flow
import { getCookie, removeCookie, addCookie } from 'lib/cookies';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import identity from 'common/modules/identity/api';
// Persistence keys
const USER_FEATURES_EXPIRY_COOKIE = 'gu_user_features_expiry';
const PAYING_MEMBER_COOKIE = 'gu_paying_member';
const AD_FREE_USER_COOKIE = 'GU_AF1';
const JOIN_DATE_COOKIE = 'gu_join_date';

const userHasData = (): boolean => {
    const cookie =
        getCookie(USER_FEATURES_EXPIRY_COOKIE) ||
        getCookie(PAYING_MEMBER_COOKIE) ||
        getCookie(AD_FREE_USER_COOKIE) ||
        getCookie(JOIN_DATE_COOKIE);
    return !!cookie;
};

const adFreeDataIsPresent = (): boolean => {
    const cookieVal = getCookie(AD_FREE_USER_COOKIE);
    return !isNaN(parseInt(cookieVal, 10));
};

const persistResponse = (JsonResponse: () => void) => {
    const switches = config.switches;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    addCookie(USER_FEATURES_EXPIRY_COOKIE, expiryDate.getTime().toString());
    addCookie(PAYING_MEMBER_COOKIE, !JsonResponse.adblockMessage);

    removeCookie('GU_AFU'); // delete the old cookie - we can remove this line again in the future

    if (switches.adFreeSubscriptionTrial && JsonResponse.adFree) {
        addCookie(AD_FREE_USER_COOKIE, expiryDate.getTime().toString());
    } else {
        removeCookie(AD_FREE_USER_COOKIE);
    }

    if (JsonResponse.membershipJoinDate) {
        addCookie(JOIN_DATE_COOKIE, JsonResponse.membershipJoinDate);
    } else {
        removeCookie(JOIN_DATE_COOKIE);
    }
};

const deleteOldData = (): void => {
    // We expect adfree cookies to be cleaned up by the logout process, but what if the user's login simply times out?
    removeCookie(USER_FEATURES_EXPIRY_COOKIE);
    removeCookie(PAYING_MEMBER_COOKIE);
    removeCookie(AD_FREE_USER_COOKIE);
    removeCookie(JOIN_DATE_COOKIE);
};

const requestNewData = (): Promise<void> =>
    fetchJson(`${config.page.userAttributesApiUrl}/me/features`, {
        mode: 'cors',
        credentials: 'include',
    })
        .then(persistResponse)
        .catch(() => {});

const datedCookieIsOld = (datedCookieName: string): boolean => {
    const expiryDateFromCookie = getCookie(datedCookieName);
    const expiryTime = parseInt(expiryDateFromCookie, 10);
    const timeNow = new Date().getTime();
    return timeNow >= expiryTime;
};

const featuresDataIsMissing = (): boolean =>
    !getCookie(USER_FEATURES_EXPIRY_COOKIE);

const featuresDataIsOld = (): boolean =>
    datedCookieIsOld(USER_FEATURES_EXPIRY_COOKIE);

const adFreeDataIsOld = (): boolean => datedCookieIsOld(AD_FREE_USER_COOKIE);

const userNeedsNewFeatureData = (): boolean =>
    featuresDataIsMissing() ||
    featuresDataIsOld() ||
    (adFreeDataIsPresent() && adFreeDataIsOld());

const userHasDataAfterSignout = (): boolean =>
    !identity.isUserLoggedIn() && userHasData();

/**
 * Updates the user's data in a lazy fashion
 */

const refresh = (): Promise<void> => {
    if (identity.isUserLoggedIn() && userNeedsNewFeatureData()) {
        return requestNewData();
    } else if (userHasDataAfterSignout()) {
        deleteOldData();
    }
    return Promise.resolve();
};

/**
 * Does our _existing_ data say the user is a paying member?
 * This data may be stale; we do not wait for userFeatures.refresh()
 * @returns {boolean}
 * @returns {boolean}
 */
const isPayingMember = (): boolean =>
    // If the user is logged in, but has no cookie yet, play it safe and assume they're a paying user
    identity.isUserLoggedIn() && getCookie(PAYING_MEMBER_COOKIE) !== 'false';

const isAdFreeUser = (): boolean => adFreeDataIsPresent() && !adFreeDataIsOld();

const toDate = (dateStr: string): Date => {
    const parts = Array.from(dateStr.split('-'), s => parseInt(s, 10));

    return new Date(parts[0], parts[1] - 1, parts[2]);
};

const isInBrexitCohort = (): boolean => {
    if (identity.isUserLoggedIn()) {
        const start = toDate('2016-06-23');
        const end = toDate('2016-07-31');

        const cookie = getCookie(JOIN_DATE_COOKIE);
        if (cookie) {
            const joinDate = toDate(cookie.toString());
            return joinDate && joinDate - start >= 0 && end - joinDate >= 0;
        }
    }
    return false;
};

export { isAdFreeUser, isPayingMember, refresh, isInBrexitCohort };
