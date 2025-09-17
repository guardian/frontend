import { setCookie, storage } from '@guardian/libs';
import { addCookie, removeCookie } from '../../../../lib/cookies';
import {
	getCountryCode,
	overrideGeolocation,
} from '../../../../lib/geolocation';
import {
	decrementMvtCookie,
	incrementMvtCookie,
	initMvtCookie,
} from '../analytics/mvt-cookie';
import { clearParticipations } from '../experiments/ab-local-storage';
import { isUserLoggedIn } from '../identity/api';
import userPrefs from '../user-prefs';
import { pageShouldHideReaderRevenue } from './contributions-utilities';

const lastClosedAtKey = 'engagementBannerLastClosedAt';
const minArticlesBeforeShowingBanner = 2;

const viewKey = 'gu.contributions.views';
const clearEpicViewLog = () => {
	storage.local.remove(viewKey);
};


const PAYING_MEMBER_COOKIE = 'gu_paying_member';
const DIGITAL_SUBSCRIBER_COOKIE = 'gu_digital_subscriber';
const HIDE_SUPPORT_MESSAGING_COOKIE = 'gu_hide_support_messaging';
const SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE =
	'gu.contributions.contrib-timestamp';
const RECURRING_CONTRIBUTOR_COOKIE = 'gu_recurring_contributor';
const SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE =
	'gu.contributions.recurring.contrib-timestamp.Monthly';
const SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE =
	'gu.contributions.recurring.contrib-timestamp.Annual';
const readerRevenueRelevantCookies = [
	PAYING_MEMBER_COOKIE,
	DIGITAL_SUBSCRIBER_COOKIE,
	RECURRING_CONTRIBUTOR_COOKIE,
	SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE,
	SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE,
	SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
	HIDE_SUPPORT_MESSAGING_COOKIE,
];

const fakeOneOffContributor = () => {
	setCookie({
		name: SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
		value: Date.now().toString(),
	});
};

const clearCommonReaderRevenueStateAndReload = (asExistingSupporter) => {
	if (pageShouldHideReaderRevenue()) {
		alert(
			'This page has "Prevent membership/contribution appeals" ticked in Composer. Please try a different page',
		);
		return;
	}

	readerRevenueRelevantCookies.forEach((cookie) => removeCookie(cookie));

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


    isUserLoggedIn().then(isLoggedIn => {
        if(isLoggedIn && !asExistingSupporter) {
            if (window.location.origin.includes('localhost')) {
                localStorage.removeItem("gu.access_token");
                localStorage.removeItem("gu.id_token");
                removeCookie('GU_U');
            } else {
                const profileUrl = window.location.origin.replace(
                    /(www\.|m\.)/,
                    'profile.',
                );
                window.location.assign(`${profileUrl}/signout`);
            }
        } else {
            window.location.reload();
        }
    })
};

const showMeTheEpic = (asExistingSupporter = false) => {
	// Clearing out the epic view log happens before all reloads
	clearCommonReaderRevenueStateAndReload(asExistingSupporter);
};

const clearBannerHistory = () => {
	userPrefs.remove(lastClosedAtKey);
};

const showMeTheBanner = (asExistingSupporter = false) => {
	clearBannerHistory();

	clearCommonReaderRevenueStateAndReload(asExistingSupporter);
};

const showMeTheDoubleBanner = (asExistingSupporter = false) => {
	showMeTheBanner(asExistingSupporter);
};

// For the below functions, assume the user can currently see the thing
// they want to display. So we don't clear out the banner history since
// we don't necessarily want the banner popping up if someone's working
// with the epic.
const showNextVariant = (asExistingSupporter = false) => {
	incrementMvtCookie();
	clearCommonReaderRevenueStateAndReload(asExistingSupporter);
};

const showPreviousVariant = (asExistingSupporter = false) => {
	decrementMvtCookie();
	clearCommonReaderRevenueStateAndReload(asExistingSupporter);
};

const changeGeolocation = (asExistingSupporter = false) => {
	const geo = window.prompt(
		`Enter two-letter geolocation code (e.g. GB, US, AU). Current is ${getCountryCode()}.`,
	);
	if (geo === 'UK') {
		alert(`'UK' is not a valid geolocation - please use 'GB' instead!`);
	} else if (geo) {
		overrideGeolocation(geo);
		clearCommonReaderRevenueStateAndReload(asExistingSupporter);
	}
};

export const init = () => {
	// Expose functions so they can be called on the console and within bookmarklets
	window.guardian.readerRevenue = {
		showMeTheEpic,
		showMeTheBanner,
		showMeTheDoubleBanner,
		showNextVariant,
		showPreviousVariant,
		changeGeolocation,
	};
};
