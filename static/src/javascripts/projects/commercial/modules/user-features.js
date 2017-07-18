// @flow
import { getCookie, removeCookie, addCookie } from 'lib/cookies';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import identity from 'common/modules/identity/api';
import { daysSince } from 'lib/time-utils';

// Persistence keys
const USER_FEATURES_EXPIRY_COOKIE = 'gu_user_features_expiry';
const PAYING_MEMBER_COOKIE = 'gu_paying_member';
const AD_FREE_USER_COOKIE = 'GU_AF1';

const userHasData = (): boolean => {
    const cookie =
        getCookie(USER_FEATURES_EXPIRY_COOKIE) ||
        getCookie(PAYING_MEMBER_COOKIE) ||
        getCookie(AD_FREE_USER_COOKIE);
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

    if (switches.adFreeSubscriptionTrial && JsonResponse.adFree) {
        addCookie(AD_FREE_USER_COOKIE, expiryDate.getTime().toString());
    }
};

const deleteOldData = (): void => {
    // We expect adfree cookies to be cleaned up by the logout process, but what if the user's login simply times out?
    removeCookie(USER_FEATURES_EXPIRY_COOKIE);
    removeCookie(PAYING_MEMBER_COOKIE);
    removeCookie(AD_FREE_USER_COOKIE);
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

const lastContributionDate = getCookie('gu.contributions.contrib-timestamp');

const daysSinceLastContribution = daysSince(lastContributionDate);

const isContributor = (): boolean => !!lastContributionDate;

// in last six months
const isRecentContributor = (): boolean => daysSinceLastContribution <= 180;

/*
    Whenever the checks are updated, please make sure to update
    applyRenderConditions.scala.js too, where the global CSS class, indicating
    the user should not see the revenue messages, is added to the body
*/
const shouldSeeReaderRevenue = (): boolean =>
    !isPayingMember() && !isRecentContributor();

const isAdFreeUser = (): boolean => adFreeDataIsPresent() && !adFreeDataIsOld();

export {
    isAdFreeUser,
    isPayingMember,
    isContributor,
    isRecentContributor,
    shouldSeeReaderRevenue,
    refresh,
};
