import type { Participations } from '@guardian/ab-core';
import { cmp, onConsentChange } from '@guardian/consent-management-platform';
import type {
	ConsentState,
	Framework,
} from '@guardian/consent-management-platform/dist/types';
import { isObject, log, storage } from '@guardian/libs';
import { once, pick } from 'lodash-es';
import config from '../../../../lib/config';
import {
	getReferrer as detectGetReferrer,
	getBreakpoint,
	getViewport,
} from '../../../../lib/detect';
import { getCountryCode } from '../../../../lib/geolocation';
import { getUrlVars } from '../../../../lib/url';
import { removeFalseyValues } from '../../../commercial/modules/header-bidding/utils';
import { getSynchronousParticipations } from '../experiments/ab';
import { isUserLoggedIn } from '../identity/api';
import { commercialFeatures } from './commercial-features';
import { clearPermutiveSegments, getPermutiveSegments } from './permutive';
import { getUserSegments } from './user-ad-targeting';

type PageTargeting = {
	sens: string;
	url: string;
	edition: string;
	ct: string;
	p: string;
	k: string;
	su: string;
	bp: string;
	x: string;
	gdncrm: string;
	pv: string;
	co: string;
	tn: string;
	slot: string;
	permutive: string;
	urlkw: string;
	skinsize: 'l' | 's';
};

let myPageTargetting: Partial<PageTargeting> = {};
let latestCmpHasInitialised: boolean;
let latestCMPState: ConsentState | null = null;
const AMTGRP_STORAGE_KEY = 'gu.adManagerGroup';

const findBreakpoint = (): 'mobile' | 'tablet' | 'desktop' => {
	switch (getBreakpoint(true)) {
		case 'mobile':
		case 'mobileMedium':
		case 'mobileLandscape':
			return 'mobile';
		case 'phablet':
		case 'tablet':
			return 'tablet';
		case 'desktop':
		case 'leftCol':
		case 'wide':
			return 'desktop';
		default:
			return 'mobile';
	}
};

const skinsizeTargetting = () => {
	const vp = getViewport();
	return vp.width >= 1560 ? 'l' : 's';
};

const inskinTargetting = () => {
	// Don’t show inskin if we cannot tell if a privacy message will be shown
	if (!cmp.hasInitialised()) return 'f';
	return cmp.willShowPrivacyMessageSync() ? 'f' : 't';
};

const WHITESPACE_CHARACTERS = /[+\s]+/g;
const format = (keyword: string): string =>
	keyword.replace(WHITESPACE_CHARACTERS, '-').toLowerCase();

const AND = /&/g;
const APOSTROPHE = /'/g;
const formatTarget = (target?: string | null): string | null =>
	target ? format(target).replace(AND, 'and').replace(APOSTROPHE, '') : null;

const abParam = (): string[] => {
	const abParticipations: Participations = getSynchronousParticipations();
	const abParams: string[] = [];

	const pushAbParams = (testName: string, testValue: unknown): void => {
		if (typeof testValue === 'string' && testValue !== 'notintest') {
			const testData = `${testName}-${testValue}`;
			// DFP key-value pairs accept value strings up to 40 characters long
			abParams.push(testData.substring(0, 40));
		}
	};

	Object.keys(abParticipations).forEach((testKey: string): void => {
		const testValue: {
			variant: string;
		} = abParticipations[testKey];
		pushAbParams(testKey, testValue.variant);
	});

	const tests = window.guardian.config.tests;

	if (isObject(tests)) {
		Object.entries(tests).forEach(([testName, testValue]) => {
			pushAbParams(testName, testValue);
		});
	}

	return abParams;
};

const getVisitedValue = (): string => {
	const visitCount: number = parseInt(
		storage.local.getRaw('gu.alreadyVisited') ?? '0',
		10,
	);

	if (visitCount <= 5) {
		return visitCount.toString();
	} else if (visitCount >= 6 && visitCount <= 9) {
		return '6-9';
	} else if (visitCount >= 10 && visitCount <= 15) {
		return '10-15';
	} else if (visitCount >= 16 && visitCount <= 19) {
		return '16-19';
	} else if (visitCount >= 20 && visitCount <= 29) {
		return '20-29';
	} else if (visitCount >= 30) {
		return '30plus';
	}

	return visitCount.toString();
};

const getReferrer = (): string | null => {
	type MatchType = {
		id: string;
		match: string;
	};

	const referrerTypes: MatchType[] = [
		{
			id: 'facebook',
			match: 'facebook.com',
		},
		{
			id: 'twitter',
			match: 't.co/',
		}, // added (/) because without slash it is picking up reddit.com too
		{
			id: 'reddit',
			match: 'reddit.com',
		},
		{
			id: 'google',
			match: 'www.google',
		},
	];

	const matchedRef: MatchType =
		referrerTypes.filter((referrerType) =>
			detectGetReferrer().includes(referrerType.match),
		)[0] || {};

	return matchedRef.id;
};

const getWhitelistedQueryParams = (): Record<string, unknown> => {
	const whiteList: string[] = ['0p19G'];
	return pick(getUrlVars(), whiteList);
};

const getUrlKeywords = (pageId?: string): string[] => {
	if (!pageId) return [];

	const segments = pageId.split('/');
	const lastPathname = segments.pop() ?? segments.pop(); // This handles a trailing slash
	return lastPathname?.split('-') ?? [];
};

const formatAppNexusTargeting = (obj: Record<string, string | string[]>) => {
	const asKeyValues = Object.keys(obj).map((key) => {
		const value = obj[key];
		return Array.isArray(value)
			? value.map((nestedValue) => `${key}=${nestedValue}`)
			: `${key}=${value}`;
	});

	const flattenDeep = Array.prototype.concat.apply([], asKeyValues);
	return flattenDeep.join(',');
};

const buildAppNexusTargetingObject = once(
	(pageTargeting: Partial<PageTargeting>): Record<string, string> =>
		removeFalseyValues({
			sens: pageTargeting.sens,
			pt1: pageTargeting.url,
			pt2: pageTargeting.edition,
			pt3: pageTargeting.ct,
			pt4: pageTargeting.p,
			pt5: pageTargeting.k,
			pt6: pageTargeting.su,
			pt7: pageTargeting.bp,
			pt8: pageTargeting.x, // OpenX cannot handle this being undefined
			pt9: [
				pageTargeting.gdncrm,
				pageTargeting.pv,
				pageTargeting.co,
				pageTargeting.tn,
				pageTargeting.slot,
			].join('|'),
			permutive: pageTargeting.permutive,
		}),
);

const buildAppNexusTargeting = once(
	(pageTargeting: Partial<PageTargeting>): string =>
		formatAppNexusTargeting(buildAppNexusTargetingObject(pageTargeting)),
);

const getRdpValue = (ccpaState: boolean | null): string => {
	if (ccpaState === null) {
		return 'na';
	}
	return ccpaState ? 't' : 'f';
};

const getTcfv2ConsentValue = (state: ConsentState | null): string => {
	if (!state || !state.tcfv2) return 'na';

	const consentedToAllPurposes =
		Object.keys(state.tcfv2.consents).length > 0 &&
		Object.values(state.tcfv2.consents).every(Boolean);

	return consentedToAllPurposes ? 't' : 'f';
};

const getAdConsentFromState = (state: ConsentState | null): boolean => {
	if (!state) return false;

	if (state.ccpa) {
		// CCPA mode
		return !state.ccpa.doNotSell;
	} else if (state.tcfv2) {
		// TCFv2 mode
		return (
			Object.keys(state.tcfv2.consents).length > 0 &&
			Object.values(state.tcfv2.consents).every(Boolean)
		);
	} else if (state.aus) {
		// AUS mode
		return state.aus.personalisedAdvertising;
	}
	// Unknown mode
	return false;
};

const getAdManagerGroup = (consented = true) => {
	if (!consented) return null;
	return storage.local.getRaw(AMTGRP_STORAGE_KEY) ?? createAdManagerGroup();
};

const createAdManagerGroup = () => {
	// users are assigned to groups 1-12
	const group = String(Math.floor(Math.random() * 12) + 1);
	storage.local.setRaw(AMTGRP_STORAGE_KEY, group);
	return group;
};

const filterEmptyValues = <T extends Record<string, unknown>>(
	pageTargets: T,
) => {
	const filtered: Partial<T> = {};
	for (const key in pageTargets) {
		const value = pageTargets[key];
		if (!value) {
			continue;
		}
		if (Array.isArray(value) && value.length === 0) {
			continue;
		}
		filtered[key] = value;
	}
	return filtered;
};

const rebuildPageTargeting = () => {
	latestCmpHasInitialised = cmp.hasInitialised();
	const adConsentState = getAdConsentFromState(latestCMPState);
	const ccpaState = latestCMPState?.ccpa
		? latestCMPState.ccpa.doNotSell
		: null;
	const tcfv2EventStatus = latestCMPState?.tcfv2
		? latestCMPState.tcfv2.eventStatus
		: 'na';

	type PageConfig = Partial<{
		section: string;
		isSensitive?: boolean;
		videoDuration?: number;
		appNexusPageTargeting?: string;
		sharedAdTargeting?: Record<string, unknown>;
		pageAdTargeting?: Partial<PageTargeting>;
		source?: string;
		pageId?: string;
	}>;

	const page = config.get<PageConfig>('config.page', { section: 'unknown' });
	const amtgrp = latestCMPState?.tcfv2
		? getAdManagerGroup(adConsentState)
		: getAdManagerGroup();
	// personalised ads targeting
	if (!adConsentState) clearPermutiveSegments();
	// flowlint-next-line sketchy-null-bool:off
	const paTargeting = { pa: adConsentState ? 't' : 'f' };
	const adFreeTargeting = commercialFeatures.adFree ? { af: 't' } : {};
	const pageTargets: PageTargeting = Object.assign(
		{
			ab: abParam(),
			amtgrp,
			at: getCookie({ name: 'adtest' }),
			bp: findBreakpoint(),
			cc: getCountryCode(), // if turned async, we could use getLocale()
			cmp_interaction: tcfv2EventStatus || 'na',
			consent_tcfv2: getTcfv2ConsentValue(latestCMPState),
			// dcre: DCR eligible
			// when the page is DCR eligible and was rendered by DCR or
			// when the page is DCR eligible but rendered by frontend for a user not in the DotcomRendering experiment
			dcre:
				window.guardian.config.isDotcomRendering ||
					config.get<boolean>('page.dcrCouldRender', false)
					? 't'
					: 'f',
			fr: getVisitedValue(),
			gdncrm: getUserSegments(adConsentState),
			inskin: inskinTargetting(),
			ms: formatTarget(page.source),
			// round video duration up to nearest 30 multiple
			vl: page.videoDuration
				? (Math.ceil(page.videoDuration / 30.0) * 30).toString()
				: undefined,
			s: page.section, // for reference in a macro, so cannot be extracted from ad unit
			si: isUserLoggedIn() ? 't' : 'f',
			rp: config.get('isDotcomRendering', false)
				? 'dotcom-rendering'
				: 'dotcom-platform', // rendering platform
			// Indicates whether the page is DCR eligible. This happens when the page
			// was DCR eligible and was actually rendered by DCR or
			// was DCR eligible but rendered by frontend for a user not in the DotcomRendering experiment
			urlkw: getUrlKeywords(page.pageId),
			rdp: getRdpValue(ccpaState),
		},
		page.sharedAdTargeting,
		paTargeting,
		adFreeTargeting,
		getWhitelistedQueryParams(),
	);

	// filter out empty values
	const pageTargeting: Partial<PageTargeting> = filterEmptyValues(
		pageTargets,
	);

	// third-parties wish to access our page targeting, before the googletag script is loaded.
	page.appNexusPageTargeting = buildAppNexusTargeting(pageTargeting);

	// This can be removed once we get sign-off from third parties who prefer to use appNexusPageTargeting.
	page.pageAdTargeting = pageTargeting;

	log('commercial', 'pageTargeting object:', pageTargeting);

	return pageTargeting;
};

const getPageTargeting = (): Partial<PageTargeting> => {
	if (Object.keys(myPageTargetting).length !== 0) {
		// If CMP was initialised since the last time myPageTargetting was built - rebuild
		if (latestCmpHasInitialised !== cmp.hasInitialised()) {
			myPageTargetting = rebuildPageTargeting();
		}
		return myPageTargetting;
	}

	// First call binds to onConsentChange and returns {}
	onConsentChange((state) => {
		// On every consent change we rebuildPageTargeting
		latestCMPState = state;
		myPageTargetting = rebuildPageTargeting();
	});
	return myPageTargetting;
};

const resetPageTargeting = (): void => {
	myPageTargetting = {};
};

export {
	getPageTargeting,
	buildAppNexusTargeting,
	buildAppNexusTargetingObject,
};

export const _ = {
	resetPageTargeting,
};
