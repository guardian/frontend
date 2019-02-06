// @flow
import { getCookie, removeCookie, addCookie } from 'lib/cookies';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { dateDiffDays } from 'lib/time-utils';

// Persistence keys
const USER_FEATURES_EXPIRY_COOKIE = 'gu_user_features_expiry';
const PAYING_MEMBER_COOKIE = 'gu_paying_member';
const AD_FREE_USER_COOKIE = 'GU_AF1';
const ACTION_REQUIRED_FOR_COOKIE = 'gu_action_required_for';
const DIGITAL_SUBSCRIBER_COOKIE = 'gu_digital_subscriber';

// This cookie comes from the user attributes API
const RECURRING_CONTRIBUTOR_COOKIE = 'gu_recurring_contributor';

// These cookies are dropped by support frontend at the point of making
// a recurring contribution
const SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE =
    'gu.contributions.recurring.contrib-timestamp.Monthly';
const SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE =
    'gu.contributions.recurring.contrib-timestamp.Annual';

const SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE =
    'gu.contributions.contrib-timestamp';

const forcedAdFreeMode: boolean = !!window.location.hash.match(
    /[#&]noadsaf(&.*)?$/
);

const userHasData = (): boolean => {
    const cookie =
        getCookie(ACTION_REQUIRED_FOR_COOKIE) ||
        getCookie(USER_FEATURES_EXPIRY_COOKIE) ||
        getCookie(PAYING_MEMBER_COOKIE) ||
        getCookie(RECURRING_CONTRIBUTOR_COOKIE) ||
        getCookie(AD_FREE_USER_COOKIE) ||
        getCookie(DIGITAL_SUBSCRIBER_COOKIE);
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
    addCookie(USER_FEATURES_EXPIRY_COOKIE, timeInDaysFromNow(1));
    addCookie(PAYING_MEMBER_COOKIE, JsonResponse.contentAccess.paidMember);
    addCookie(
        RECURRING_CONTRIBUTOR_COOKIE,
        JsonResponse.contentAccess.recurringContributor
    );
    addCookie(
        DIGITAL_SUBSCRIBER_COOKIE,
        JsonResponse.contentAccess.digitalPack
    );

    removeCookie(ACTION_REQUIRED_FOR_COOKIE);
    if ('alertAvailableFor' in JsonResponse) {
        addCookie(ACTION_REQUIRED_FOR_COOKIE, JsonResponse.alertAvailableFor);
    }

    if (
        adFreeDataIsPresent() &&
        !forcedAdFreeMode &&
        !JsonResponse.contentAccess.digitalPack
    ) {
        removeCookie(AD_FREE_USER_COOKIE);
    }

    if (JsonResponse.contentAccess.digitalPack) {
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
    removeCookie(DIGITAL_SUBSCRIBER_COOKIE);
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
    } else if (userHasDataAfterSignout() && !forcedAdFreeMode) {
        deleteOldData();
    }
    return Promise.resolve();
};

const supportSiteRecurringCookiePresent = () =>
    getCookie(SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE) != null ||
    getCookie(SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE) != null;

/**
 * Does our _existing_ data say the user is a paying member?
 * This data may be stale; we do not wait for userFeatures.refresh()
 */
const isPayingMember = (): boolean =>
    // If the user is logged in, but has no cookie yet, play it safe and assume they're a paying user
    isUserLoggedIn() && getCookie(PAYING_MEMBER_COOKIE) !== 'false';

// number returned is Epoch time in milliseconds.
// null value signifies no last contribution date.
const getLastOneOffContributionDate = (): number | null => {
    const cookie = getCookie(SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE);

    if (!cookie) {
        return null;
    }

    // Contributions frontend set date time of last contribution using ISO 8601 format.
    // Support frontend set date time of last contribution in Epoch milliseconds.
    // If we first attempted to parse cookie in Epoch milliseconds format (parseInt()),
    // then a value in ISO 8601 format would parse (incorrectly) e.g. 2018-08-17T16:11:10Z => 2018
    // So first attempt to parse cookie in ISO 8601 format.

    let ms;

    ms = Date.parse(cookie);
    if (Number.isInteger(ms)) {
        return ms;
    }

    ms = parseInt(cookie, 10);
    if (Number.isInteger(ms)) {
        return ms;
    }

    return null;
};

const getDaysSinceLastOneOffContribution = (): number | null => {
    const lastContributionDate = getLastOneOffContributionDate();
    if (lastContributionDate === null) {
        return null;
    }
    return dateDiffDays(lastContributionDate, Date.now());
};

// in last six months
const isRecentOneOffContributor = (): boolean => {
    const daysSinceLastContribution = getDaysSinceLastOneOffContribution();
    if (daysSinceLastContribution === null) {
        return false;
    }
    return daysSinceLastContribution <= 180;
};

const isRecurringContributor = (): boolean =>
    // If the user is logged in, but has no cookie yet, play it safe and assume they're a contributor
    (isUserLoggedIn() && getCookie(RECURRING_CONTRIBUTOR_COOKIE) !== 'false') ||
    supportSiteRecurringCookiePresent();

const isDigitalSubscriber = (): boolean =>
    getCookie(DIGITAL_SUBSCRIBER_COOKIE) === 'true';

/*
    Whenever the checks are updated, please make sure to update
    applyRenderConditions.scala.js too, where the global CSS class, indicating
    the user should not see the revenue messages, is added to the body.
    Please also update readerRevenueRelevantCookies below, if changing the cookies
    which this function is dependent on.
*/
const userIsSupporter = (): boolean =>
    isPayingMember() ||
    isRecentOneOffContributor() ||
    isRecurringContributor() ||
    isDigitalSubscriber();

const readerRevenueRelevantCookies = [
    PAYING_MEMBER_COOKIE,
    DIGITAL_SUBSCRIBER_COOKIE,
    RECURRING_CONTRIBUTOR_COOKIE,
    SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE,
    SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE,
    SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
];

// For debug/test purposes
const fakeOneOffContributor = (): void => {
    addCookie(SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE, Date.now().toString());
};

const isAdFreeUser = (): boolean =>
    isDigitalSubscriber() || (adFreeDataIsPresent() && !adFreeDataIsOld());

export {
    accountDataUpdateWarning,
    isAdFreeUser,
    isPayingMember,
    isRecentOneOffContributor,
    isRecurringContributor,
    isDigitalSubscriber,
    userIsSupporter,
    refresh,
    deleteOldData,
    getLastOneOffContributionDate,
    getDaysSinceLastOneOffContribution,
    readerRevenueRelevantCookies,
    fakeOneOffContributor,
};
