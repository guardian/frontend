import { getCookie, isObject } from '@guardian/libs';
import { noop } from 'lib/noop';
import config from '../../../../lib/config';
import { addCookie, removeCookie } from '../../../../lib/cookies';
import { fetchJson } from '../../../../lib/fetch-json';
import { dateDiffDays } from '../../../../lib/time-utils';
import { isUserLoggedIn } from '../identity/api';

// Persistence keys
const USER_FEATURES_EXPIRY_COOKIE = 'gu_user_features_expiry';
const PAYING_MEMBER_COOKIE = 'gu_paying_member';
const AD_FREE_USER_COOKIE = 'GU_AF1';
const ACTION_REQUIRED_FOR_COOKIE = 'gu_action_required_for';
const DIGITAL_SUBSCRIBER_COOKIE = 'gu_digital_subscriber';
const HIDE_SUPPORT_MESSAGING_COOKIE = 'gu_hide_support_messaging';

// These cookies come from the user attributes API
const RECURRING_CONTRIBUTOR_COOKIE = 'gu_recurring_contributor';
const ONE_OFF_CONTRIBUTION_DATE_COOKIE = 'gu_one_off_contribution_date';

// These cookies are dropped by support frontend at the point of making
// a recurring contribution
const SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE =
	'gu.contributions.recurring.contrib-timestamp.Monthly';
const SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE =
	'gu.contributions.recurring.contrib-timestamp.Annual';
const SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE =
	'gu.contributions.contrib-timestamp';

const ARTICLES_VIEWED_OPT_OUT_COOKIE = {
	name: 'gu_article_count_opt_out',
	daysToLive: 90,
};

const CONTRIBUTIONS_REMINDER_SIGNED_UP = {
	name: 'gu_contributions_reminder_signed_up',
	daysToLive: 90,
};

// TODO: isn’t this duplicated from commercial features? https://git.io/JMvcu
const forcedAdFreeMode = !!/[#&]noadsaf(&.*)?$/.exec(window.location.hash);

const userHasData = () => {
	const cookie =
		getCookie({ name: ACTION_REQUIRED_FOR_COOKIE }) ??
		getCookie({ name: USER_FEATURES_EXPIRY_COOKIE }) ??
		getCookie({ name: PAYING_MEMBER_COOKIE }) ??
		getCookie({ name: RECURRING_CONTRIBUTOR_COOKIE }) ??
		getCookie({ name: ONE_OFF_CONTRIBUTION_DATE_COOKIE }) ??
		getCookie({ name: AD_FREE_USER_COOKIE }) ??
		getCookie({ name: DIGITAL_SUBSCRIBER_COOKIE }) ??
		getCookie({ name: HIDE_SUPPORT_MESSAGING_COOKIE });
	return !!cookie;
};

const accountDataUpdateWarning = (): string | null =>
	getCookie({ name: ACTION_REQUIRED_FOR_COOKIE });

const adFreeDataIsPresent = (): boolean => {
	const cookieVal = getCookie({ name: AD_FREE_USER_COOKIE });
	if (!cookieVal) return false;
	return !Number.isNaN(parseInt(cookieVal, 10));
};

const timeInDaysFromNow = (daysFromNow: number): string => {
	const tmpDate = new Date();
	tmpDate.setDate(tmpDate.getDate() + daysFromNow);
	return tmpDate.getTime().toString();
};

type LocalDate = `${number}-${string}-${string}`;

/**
 * This type is manually kept in sync with the Membership API:
 * https://github.com/guardian/members-data-api/blob/a48acdebed6a334ceb4336ece275b9cf9b3d6bb7/membership-attribute-service/app/models/Attributes.scala#L134-L151
 */
type UserFeaturesResponse = {
	userId: string;
	tier?: string;
	recurringContributionPaymentPlan?: string;
	oneOffContributionDate?: LocalDate;
	membershipJoinDate?: LocalDate;
	digitalSubscriptionExpiryDate?: LocalDate;
	paperSubscriptionExpiryDate?: LocalDate;
	guardianWeeklyExpiryDate?: LocalDate;
	liveAppSubscriptionExpiryDate?: LocalDate;
	alertAvailableFor?: string;

	showSupportMessaging: boolean;

	contentAccess: {
		member: boolean;
		paidMember: boolean;
		recurringContributor: boolean;
		digitalPack: boolean;
		paperSubscriber: boolean;
		guardianWeeklySubscriber: boolean;
	};
};

/**
 * TODO: check that this validation is accurate
 */
const validateResponse = (
	response: unknown,
): response is UserFeaturesResponse => {
	if (!isObject(response)) return false;

	if (
		typeof response.showSupportMessaging === 'boolean' &&
		isObject(response.contentAccess) &&
		typeof response.contentAccess.paidMember === 'boolean' &&
		typeof response.contentAccess.recurringContributor === 'boolean' &&
		typeof response.contentAccess.digitalPack === 'boolean'
	) {
		return true;
	}

	return true;
};

const persistResponse = (JsonResponse: UserFeaturesResponse) => {
	addCookie(USER_FEATURES_EXPIRY_COOKIE, timeInDaysFromNow(1));
	addCookie(PAYING_MEMBER_COOKIE, JsonResponse.contentAccess.paidMember);
	addCookie(
		RECURRING_CONTRIBUTOR_COOKIE,
		JsonResponse.contentAccess.recurringContributor,
	);
	addCookie(
		DIGITAL_SUBSCRIBER_COOKIE,
		JsonResponse.contentAccess.digitalPack,
	);
	addCookie(
		HIDE_SUPPORT_MESSAGING_COOKIE,
		!JsonResponse.showSupportMessaging,
	);
	if (JsonResponse.oneOffContributionDate) {
		addCookie(
			ONE_OFF_CONTRIBUTION_DATE_COOKIE,
			JsonResponse.oneOffContributionDate,
		);
	}

	removeCookie(ACTION_REQUIRED_FOR_COOKIE);
	if (JsonResponse.alertAvailableFor) {
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
	removeCookie(HIDE_SUPPORT_MESSAGING_COOKIE);
	removeCookie(ONE_OFF_CONTRIBUTION_DATE_COOKIE);
};

const requestNewData = () =>
	fetchJson(
		`${config.get<string>(
			'page.userAttributesApiUrl',
			'/USER_ATTRIBUTE_API_NOT_FOUND',
		)}/me`,
		{
			mode: 'cors',
			credentials: 'include',
		},
	)
		.then((response) => {
			if (!validateResponse(response))
				throw new Error('invalid response');
			return response;
		})
		.then(persistResponse)
		.catch(noop);

const datedCookieIsOldOrMissing = (datedCookieName: string): boolean => {
	const expiryDateFromCookie = getCookie({ name: datedCookieName });
	if (!expiryDateFromCookie) return true;
	const expiryTime = parseInt(expiryDateFromCookie, 10);
	const timeNow = new Date().getTime();
	return timeNow >= expiryTime;
};

const featuresDataIsOld = () =>
	datedCookieIsOldOrMissing(USER_FEATURES_EXPIRY_COOKIE);

const adFreeDataIsOld = (): boolean => {
	const { switches } = window.guardian.config;
	return (
		Boolean(switches.adFreeStrictExpiryEnforcement) &&
		datedCookieIsOldOrMissing(AD_FREE_USER_COOKIE)
	);
};

const userNeedsNewFeatureData = (): boolean =>
	featuresDataIsOld() || (adFreeDataIsPresent() && adFreeDataIsOld());

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
	getCookie({ name: SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE }) != null ||
	getCookie({ name: SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE }) != null;

/**
 * Does our _existing_ data say the user is a paying member?
 * This data may be stale; we do not wait for userFeatures.refresh()
 */
const isPayingMember = (): boolean =>
	// If the user is logged in, but has no cookie yet, play it safe and assume they're a paying user
	isUserLoggedIn() && getCookie({ name: PAYING_MEMBER_COOKIE }) !== 'false';

// Expects milliseconds since epoch
const getSupportFrontendOneOffContributionTimestamp = (): number | null => {
	const supportFrontendCookie = getCookie({
		name: SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
	});

	if (supportFrontendCookie) {
		const ms = parseInt(supportFrontendCookie, 10);
		if (Number.isInteger(ms)) return ms;
	}

	return null;
};

// Expects YYYY-MM-DD format
const getAttributesOneOffContributionTimestamp = (): number | null => {
	const attributesCookie = getCookie({
		name: ONE_OFF_CONTRIBUTION_DATE_COOKIE,
	});

	if (attributesCookie) {
		const ms = Date.parse(attributesCookie);
		if (Number.isInteger(ms)) return ms;
	}

	return null;
};

// number returned is Epoch time in milliseconds.
// null value signifies no last contribution date.
const getLastOneOffContributionTimestamp = (): number | null =>
	getSupportFrontendOneOffContributionTimestamp() ??
	getAttributesOneOffContributionTimestamp();

const getLastOneOffContributionDate = (): LocalDate | null => {
	const timestamp = getLastOneOffContributionTimestamp();

	if (timestamp === null) {
		return null;
	}

	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');

	return `${year}-${month}-${day}`;
};

const getLastRecurringContributionDate = (): number | null => {
	// Check for cookies, ensure that cookies parse, and ensure parsed results are integers
	const monthlyCookie = getCookie({
		name: SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE,
	});
	const annualCookie = getCookie({
		name: SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE,
	});
	const monthlyTime = monthlyCookie ? parseInt(monthlyCookie, 10) : null;
	const annualTime = annualCookie ? parseInt(annualCookie, 10) : null;
	const monthlyMS =
		monthlyTime && Number.isInteger(monthlyTime) ? monthlyTime : null;
	const annualMS =
		annualTime && Number.isInteger(annualTime) ? annualTime : null;

	if (!monthlyMS && !annualMS) {
		return null;
	}

	if (monthlyMS && annualMS) {
		return Math.max(monthlyMS, annualMS);
	}

	return monthlyMS ?? annualMS ?? null;
};

const getDaysSinceLastOneOffContribution = (): number | null => {
	const lastContributionDate = getLastOneOffContributionTimestamp();
	if (lastContributionDate === null) {
		return null;
	}
	return dateDiffDays(lastContributionDate, Date.now());
};

// defaults to last three months
const isRecentOneOffContributor = (askPauseDays = 90): boolean => {
	const daysSinceLastContribution = getDaysSinceLastOneOffContribution();
	if (daysSinceLastContribution === null) {
		return false;
	}
	return daysSinceLastContribution <= askPauseDays;
};

// true if the user has completed their ask-free period
const isPostAskPauseOneOffContributor = (askPauseDays = 90): boolean => {
	const daysSinceLastContribution = getDaysSinceLastOneOffContribution();
	if (daysSinceLastContribution === null) {
		return false;
	}
	return daysSinceLastContribution > askPauseDays;
};

const isRecurringContributor = (): boolean =>
	// If the user is logged in, but has no cookie yet, play it safe and assume they're a contributor
	(isUserLoggedIn() &&
		getCookie({ name: RECURRING_CONTRIBUTOR_COOKIE }) !== 'false') ||
	supportSiteRecurringCookiePresent();

const isDigitalSubscriber = (): boolean =>
	getCookie({ name: DIGITAL_SUBSCRIBER_COOKIE }) === 'true';

const shouldNotBeShownSupportMessaging = (): boolean =>
	getCookie({ name: HIDE_SUPPORT_MESSAGING_COOKIE }) === 'true';

/*
    Whenever the checks are updated, please make sure to update
    applyRenderConditions.scala.js too, where the global CSS class, indicating
    the user should not see the revenue messages, is added to the body.
    Please also update readerRevenueRelevantCookies below, if changing the cookies
    which this function is dependent on.
*/

const shouldHideSupportMessaging = (): boolean =>
	shouldNotBeShownSupportMessaging() ||
	isRecentOneOffContributor() || // because members-data-api is unaware of one-off contributions so relies on cookie
	isRecurringContributor(); // guest checkout means that members-data-api isn't aware of all recurring contributions so relies on cookie

const readerRevenueRelevantCookies = [
	PAYING_MEMBER_COOKIE,
	DIGITAL_SUBSCRIBER_COOKIE,
	RECURRING_CONTRIBUTOR_COOKIE,
	SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE,
	SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE,
	SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
	HIDE_SUPPORT_MESSAGING_COOKIE,
];

// For debug/test purposes
const fakeOneOffContributor = (): void => {
	addCookie(SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE, Date.now().toString());
};

const isAdFreeUser = (): boolean =>
	isDigitalSubscriber() || (adFreeDataIsPresent() && !adFreeDataIsOld());

// Extend the expiry of the contributions cookie by 1 year beyond the date of the contribution
const extendContribsCookieExpiry = (): void => {
	const cookie = getCookie({ name: SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE });
	if (cookie) {
		const contributionDate = parseInt(cookie, 10);
		if (Number.isInteger(contributionDate)) {
			const daysToLive = 365 - dateDiffDays(contributionDate, Date.now());
			addCookie(
				SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
				contributionDate.toString(),
				daysToLive,
			);
		}
	}
};

const canShowContributionsReminderFeature = (): boolean => {
	const signedUpForReminder = !!getCookie({
		name: CONTRIBUTIONS_REMINDER_SIGNED_UP.name,
	});
	const { switches } = window.guardian.config;

	return Boolean(switches.showContributionReminder) && !signedUpForReminder;
};

export {
	accountDataUpdateWarning,
	isAdFreeUser,
	isPayingMember,
	isRecentOneOffContributor,
	isRecurringContributor,
	isDigitalSubscriber,
	shouldHideSupportMessaging,
	refresh,
	deleteOldData,
	getLastOneOffContributionTimestamp,
	getLastOneOffContributionDate,
	getLastRecurringContributionDate,
	getDaysSinceLastOneOffContribution,
	isPostAskPauseOneOffContributor,
	readerRevenueRelevantCookies,
	fakeOneOffContributor,
	shouldNotBeShownSupportMessaging,
	extendContribsCookieExpiry,
	ARTICLES_VIEWED_OPT_OUT_COOKIE,
	CONTRIBUTIONS_REMINDER_SIGNED_UP,
	canShowContributionsReminderFeature,
};
