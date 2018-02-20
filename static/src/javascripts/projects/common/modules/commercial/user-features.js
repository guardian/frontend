// @flow
import { getCookie, removeCookie, addCookie } from 'lib/cookies';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { daysSince } from 'lib/time-utils';

// Persistence keys
const USER_FEATURES_EXPIRY_COOKIE = 'gu_user_features_expiry';
const PAYING_MEMBER_COOKIE = 'gu_paying_member';
const RECURRING_CONTRIBUTOR_COOKIE = 'gu_recurring_contributor';
const AD_FREE_USER_COOKIE = 'GU_AF1';
const ACTION_REQUIRED_FOR_COOKIE = 'gu_action_required_for';

const userHasData = (): boolean => {
    const cookie =
        getCookie(USER_FEATURES_EXPIRY_COOKIE) ||
        getCookie(PAYING_MEMBER_COOKIE) ||
        getCookie(RECURRING_CONTRIBUTOR_COOKIE) ||
        getCookie(AD_FREE_USER_COOKIE);
    return !!cookie;
};

const accountDataUpdateWarning = (): ?string =>
    getCookie(ACTION_REQUIRED_FOR_COOKIE);

const adFreeDataIsPresent = (): boolean => {
    const cookieVal = getCookie(AD_FREE_USER_COOKIE);
    return !Number.isNaN(parseInt(cookieVal, 10));
};

const timeInDaysFromNow = (daysFromNow: number): string => {
    const tmpDate = new Date();
    tmpDate.setDate(tmpDate.getDate() + daysFromNow);
    return tmpDate.getTime().toString();
};

const persistResponse = (JsonResponse: () => void) => {
    const switches = config.switches;
    addCookie(USER_FEATURES_EXPIRY_COOKIE, timeInDaysFromNow(1));
    addCookie(PAYING_MEMBER_COOKIE, JsonResponse.contentAccess.paidMember);
    addCookie(
        RECURRING_CONTRIBUTOR_COOKIE,
        JsonResponse.contentAccess.recurringContributor
    );

    removeCookie(ACTION_REQUIRED_FOR_COOKIE);
    if ('alertAvailableFor' in JsonResponse) {
        addCookie(ACTION_REQUIRED_FOR_COOKIE, JsonResponse.alertAvailableFor);
    }

    if (adFreeDataIsPresent() && !JsonResponse.adFree) {
        removeCookie(AD_FREE_USER_COOKIE);
    }
    if (switches.adFreeSubscriptionTrial && JsonResponse.adFree) {
        addCookie(AD_FREE_USER_COOKIE, timeInDaysFromNow(2));
    }
};

const deleteOldData = (): void => {
    // We expect adfree cookies to be cleaned up by the logout process, but what if the user's login simply times out?
    removeCookie(USER_FEATURES_EXPIRY_COOKIE);
    removeCookie(PAYING_MEMBER_COOKIE);
    removeCookie(RECURRING_CONTRIBUTOR_COOKIE);
    removeCookie(AD_FREE_USER_COOKIE);
    removeCookie(ACTION_REQUIRED_FOR_COOKIE);
};

const requestNewData = (): Promise<void> =>
    fetchJson(`${config.page.userAttributesApiUrl}/me`, {
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

const adFreeDataIsOld = (): boolean => {
    const switches = config.switches;
    return (
        switches.adFreeStrictExpiryEnforcement &&
        datedCookieIsOld(AD_FREE_USER_COOKIE)
    );
};

const userNeedsNewFeatureData = (): boolean =>
    featuresDataIsMissing() ||
    featuresDataIsOld() ||
    (adFreeDataIsPresent() && adFreeDataIsOld());

const userHasDataAfterSignout = (): boolean =>
    !isUserLoggedIn() && userHasData();

/**
 * Updates the user's data in a lazy fashion
 */
const refresh = (): Promise<void> => {
    if (isUserLoggedIn() && userNeedsNewFeatureData()) {
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
 */ const isPayingMember = (): boolean =>
    // If the user is logged in, but has no cookie yet, play it safe and assume they're a paying user
    isUserLoggedIn() && getCookie(PAYING_MEMBER_COOKIE) !== 'false';

const lastContributionDate = getCookie('gu.contributions.contrib-timestamp');

const daysSinceLastContribution = daysSince(lastContributionDate);

const isContributor = (): boolean => !!lastContributionDate;

// in last six months
const isRecentContributor = (): boolean => daysSinceLastContribution <= 180;

const isRecurringContributor = (): boolean =>
    // If the user is logged in, but has no cookie yet, play it safe and assume they're a contributor
    isUserLoggedIn() && getCookie(RECURRING_CONTRIBUTOR_COOKIE) !== 'false';

/*
    Whenever the checks are updated, please make sure to update
    applyRenderConditions.scala.js too, where the global CSS class, indicating
    the user should not see the revenue messages, is added to the body
*/
const shouldSeeReaderRevenue = (): boolean =>
    !isPayingMember() && !isRecentContributor() && !isRecurringContributor();

const isAdFreeUser = (): boolean => adFreeDataIsPresent() && !adFreeDataIsOld();

export {
    accountDataUpdateWarning,
    isAdFreeUser,
    isPayingMember,
    isContributor,
    isRecentContributor,
    isRecurringContributor,
    shouldSeeReaderRevenue,
    refresh,
    deleteOldData,
};
