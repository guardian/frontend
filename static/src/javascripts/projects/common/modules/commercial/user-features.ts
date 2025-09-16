import { getCookie, isObject, removeCookie, setCookie } from '@guardian/libs';
import { noop } from 'lib/noop';
import { fetchJson } from '../../../../lib/fetch-json';
import { dateDiffDays } from '../../../../lib/time-utils';
import { getLocalDate } from '../../../../types/dates';
import type { LocalDate } from '../../../../types/dates';
import type { UserFeaturesResponse } from '../../../../types/membership';
import {
	getAuthStatus,
	getOptionsHeaders,
	isUserLoggedIn,
} from '../../modules/identity/api';
import { cookieIsExpiredOrMissing, timeInDaysFromNow } from './lib/cookie';

// Persistence keys
const USER_BENEFITS_EXPIRY_COOKIE = 'gu_user_benefits_expiry';
const PAYING_MEMBER_COOKIE = 'gu_paying_member';
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

const AD_FREE_USER_COOKIE = 'GU_AF1';

// TODO: isn’t this duplicated from commercial features?
// https://github.com/guardian/frontend/blob/2a222cfb77748aa1140e19adca10bfc688fe6cad/static/src/javascripts/projects/common/modules/commercial/commercial-features.ts

const forcedAdFreeMode = !!/[#&]noadsaf(&.*)?$/.exec(window.location.hash);

const getAdFreeCookie = (): string | null =>
	getCookie({ name: AD_FREE_USER_COOKIE });

const adFreeDataIsPresent = (): boolean => {
	const cookieVal = getAdFreeCookie();
	if (!cookieVal) return false;
	return !Number.isNaN(parseInt(cookieVal, 10));
};

const setAdFreeCookie = (daysToLive = 1): void => {
	const expires = new Date();
	expires.setMonth(expires.getMonth() + 6);
	setCookie({
		name: AD_FREE_USER_COOKIE,
		value: expires.getTime().toString(),
		daysToLive,
	});
};

const userHasData = () => {
	const cookie =
		getAdFreeCookie() ??
		getCookie({ name: ACTION_REQUIRED_FOR_COOKIE }) ??
		getCookie({ name: USER_BENEFITS_EXPIRY_COOKIE }) ??
		getCookie({ name: PAYING_MEMBER_COOKIE }) ??
		getCookie({ name: RECURRING_CONTRIBUTOR_COOKIE }) ??
		getCookie({ name: ONE_OFF_CONTRIBUTION_DATE_COOKIE }) ??
		getCookie({ name: DIGITAL_SUBSCRIBER_COOKIE }) ??
		getCookie({ name: HIDE_SUPPORT_MESSAGING_COOKIE });
	return !!cookie;
};

const accountDataUpdateWarning = (): string | null =>
	getCookie({ name: ACTION_REQUIRED_FOR_COOKIE });

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
	setCookie({
		name: USER_BENEFITS_EXPIRY_COOKIE,
		value: timeInDaysFromNow(1),
	});
	setCookie({
		name: PAYING_MEMBER_COOKIE,
		value: String(JsonResponse.contentAccess.paidMember),
	});
	setCookie({
		name: RECURRING_CONTRIBUTOR_COOKIE,
		value: String(JsonResponse.contentAccess.recurringContributor),
	});
	setCookie({
		name: DIGITAL_SUBSCRIBER_COOKIE,
		value: String(JsonResponse.contentAccess.digitalPack),
	});
	setCookie({
		name: HIDE_SUPPORT_MESSAGING_COOKIE,
		value: String(!JsonResponse.showSupportMessaging),
	});
	if (JsonResponse.oneOffContributionDate) {
		setCookie({
			name: ONE_OFF_CONTRIBUTION_DATE_COOKIE,
			value: JsonResponse.oneOffContributionDate,
		});
	}
	removeCookie({ name: ACTION_REQUIRED_FOR_COOKIE });
	if (JsonResponse.alertAvailableFor) {
		setCookie({
			name: ACTION_REQUIRED_FOR_COOKIE,
			value: JsonResponse.alertAvailableFor,
		});
	}
	if (JsonResponse.contentAccess.digitalPack) {
		setAdFreeCookie(2);
	} else if (adFreeDataIsPresent() && !forcedAdFreeMode) {
		removeCookie({ name: AD_FREE_USER_COOKIE });
	}
};

const deleteOldData = (): void => {
	removeCookie({ name: AD_FREE_USER_COOKIE });
	removeCookie({ name: USER_BENEFITS_EXPIRY_COOKIE });
	removeCookie({ name: PAYING_MEMBER_COOKIE });
	removeCookie({ name: RECURRING_CONTRIBUTOR_COOKIE });
	removeCookie({ name: ACTION_REQUIRED_FOR_COOKIE });
	removeCookie({ name: DIGITAL_SUBSCRIBER_COOKIE });
	removeCookie({ name: HIDE_SUPPORT_MESSAGING_COOKIE });
	removeCookie({ name: ONE_OFF_CONTRIBUTION_DATE_COOKIE });
};

const requestNewData = () => {
	return getAuthStatus()
		.then((authStatus) =>
			authStatus.kind === 'SignedIn'
				? authStatus
				: Promise.reject('The user is not signed in'),
		)
		.then((signedInAuthStatus) => {
			return fetchJson(
				`${
					window.guardian.config.page.userAttributesApiUrl ??
					'/USER_ATTRIBUTE_API_NOT_FOUND'
				}/me`,
				{
					mode: 'cors',
					...getOptionsHeaders(signedInAuthStatus),
				},
			)
				.then((response) => {
					if (!validateResponse(response)) {
						throw new Error('invalid response');
					}
					return response;
				})
				.then(persistResponse)
				.catch(noop);
		});
};

const featuresDataIsOld = () =>
	cookieIsExpiredOrMissing(USER_BENEFITS_EXPIRY_COOKIE);

const userNeedsNewFeatureData = (): boolean =>
	featuresDataIsOld() || (isDigitalSubscriber() && !adFreeDataIsPresent());

const userHasDataAfterSignout = async (): Promise<boolean> =>
	!(await isUserLoggedIn()) && userHasData();

/**
 * Updates the user's data in a lazy fashion
 */
const refresh = async (): Promise<void> => {
	if ((await isUserLoggedIn()) && userNeedsNewFeatureData()) {
		return requestNewData();
	} else if ((await userHasDataAfterSignout()) && !forcedAdFreeMode) {
		deleteOldData();
	}
};

const supportSiteRecurringCookiePresent = () =>
	getCookie({ name: SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE }) != null ||
	getCookie({ name: SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE }) != null;

/**
 * Does our _existing_ data say the user is a paying member?
 * This data may be stale; we do not wait for userFeatures.refresh()
 */
const isPayingMember = async (): Promise<boolean> =>
	// If the user is logged in, but has no cookie yet, play it safe and assume they're a paying user
	(await isUserLoggedIn()) &&
	getCookie({ name: PAYING_MEMBER_COOKIE }) !== 'false';

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
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth() + 1;
	const day = date.getUTCDate();

	return getLocalDate(year, month, day);
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

const isRecurringContributor = async (): Promise<boolean> =>
	((await isUserLoggedIn()) &&
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

const shouldHideSupportMessaging = async (): Promise<boolean> =>
	shouldNotBeShownSupportMessaging() ||
	isRecentOneOffContributor() || // because members-data-api is unaware of one-off contributions so relies on cookie
	(await isRecurringContributor()); // guest checkout means that members-data-api isn't aware of all recurring contributions so relies on cookie

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
	setCookie({
		name: SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
		value: Date.now().toString(),
	});
};

// Extend the expiry of the contributions cookie by 1 year beyond the date of the contribution
const extendContribsCookieExpiry = (): void => {
	const cookie = getCookie({ name: SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE });
	if (cookie) {
		const contributionDate = parseInt(cookie, 10);
		if (Number.isInteger(contributionDate)) {
			const daysToLive = 365 - dateDiffDays(contributionDate, Date.now());
			setCookie({
				name: SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
				value: contributionDate.toString(),
				daysToLive,
			});
		}
	}
};

const _ = {
	isRecentOneOffContributor,
	isDigitalSubscriber,
	getDaysSinceLastOneOffContribution,
	isPostAskPauseOneOffContributor,
	shouldNotBeShownSupportMessaging,
};

export {
	_,
	accountDataUpdateWarning,
	isPayingMember,
	isRecurringContributor,
	setAdFreeCookie,
	shouldHideSupportMessaging,
	refresh,
	getLastOneOffContributionTimestamp,
	getLastOneOffContributionDate,
	getLastRecurringContributionDate,
	readerRevenueRelevantCookies,
	fakeOneOffContributor,
	extendContribsCookieExpiry,
	ARTICLES_VIEWED_OPT_OUT_COOKIE,
};
