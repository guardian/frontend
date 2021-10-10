import { storage } from '@guardian/libs';
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
import {
	fakeOneOffContributor,
	readerRevenueRelevantCookies,
} from './user-features';

const lastClosedAtKey = 'engagementBannerLastClosedAt';
const minArticlesBeforeShowingBanner = 2;

const viewKey = 'gu.contributions.views';
const clearEpicViewLog = () => {
	storage.local.remove(viewKey);
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

	if (isUserLoggedIn() && !asExistingSupporter) {
		if (window.location.origin.includes('localhost')) {
			// Assume they don't have identity running locally
			// So try and remove the identity cookie manually
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

	// The banner only displays after a certain number of pageviews. So let's get there quick!
	storage.local.setRaw(
		'gu.alreadyVisited',
		minArticlesBeforeShowingBanner + 1,
	);

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
