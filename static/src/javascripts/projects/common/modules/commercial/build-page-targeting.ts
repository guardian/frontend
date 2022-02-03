import {
	clearPermutiveSegments,
	getPermutiveSegments,
} from '@guardian/commercial-core';
import { getContentTargeting } from '@guardian/commercial-core/dist/esm/targeting/content';
import type { ContentTargeting } from '@guardian/commercial-core/dist/esm/targeting/content';
import type { SessionTargeting } from '@guardian/commercial-core/dist/esm/targeting/session';
import { getSessionTargeting } from '@guardian/commercial-core/dist/esm/targeting/session';
import { cmp } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import type { TCFv2ConsentList } from '@guardian/consent-management-platform/dist/types/tcfv2';
import type { CountryCode } from '@guardian/libs';
import { getCookie, isString, log, storage } from '@guardian/libs';
import { once } from 'lodash-es';
import config from '../../../../lib/config';
import { getReferrer as detectGetReferrer } from '../../../../lib/detect';
import { getTweakpoint, getViewport } from '../../../../lib/detect-viewport';
import { getCountryCode } from '../../../../lib/geolocation';
import { removeFalseyValues } from '../../../commercial/modules/header-bidding/utils';
import { getSynchronousParticipations } from '../experiments/ab';
import { isUserLoggedIn } from '../identity/api';
import { commercialFeatures } from './commercial-features';

// https://admanager.google.com/59666047#inventory/custom_targeting/list

type TrueOrFalse = 't' | 'f';

type PartialWithNulls<T> = { [P in keyof T]?: T[P] | null };

const frequency = [
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6-9',
	'10-15',
	'16-19',
	'20-29',
	'30plus',
] as const;

const adManagerGroups = [
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'11',
	'12',
] as const;

type Frequency = typeof frequency[number];
type AdManagerGroup = typeof adManagerGroups[number];
type ContentType =
	| 'video'
	| 'tag'
	| 'section'
	| 'network-front'
	| 'liveblog'
	| 'interactive'
	| 'gallery'
	| 'crossword'
	| 'audio'
	| 'article';

export type PageTargeting = PartialWithNulls<{
	ab: string[];
	at: string; // Ad Test
	bl: string[]; // BLog tags
	bp: 'mobile' | 'tablet' | 'desktop'; // BreakPoint
	cc: CountryCode; // Country Code
	co: string; // COntributor
	ct: ContentType;
	dcre: TrueOrFalse; // DotCom-Rendering Eligible
	edition: 'uk' | 'us' | 'au' | 'int';
	k: string[]; // Keywords
	p: 'r2' | 'ng' | 'app' | 'amp'; // Platform (web)
	pa: TrueOrFalse; // Personalised Ads consent
	permutive: string[]; // predefined segment values
	pv: string; // ophan Page View id
	rp: 'dotcom-rendering' | 'dotcom-platform'; // Rendering Platform
	sens: TrueOrFalse; // SenSitive
	si: TrueOrFalse; // Signed In
	skinsize: 'l' | 's';
	su: string; // SUrging article
	tn: string; // ToNe
	url: string;
	urlkw: string[]; // URL KeyWords
	vl: string; // Video Length
	rdp: string;
	consent_tcfv2: string;
	cmp_interaction: string;
	se: string; // SEries
	ob: 't'; // OBserver content
	br: 's' | 'p' | 'f'; // BRanding
	af: 't'; // Ad Free
	fr: Frequency; // FRequency
	ref: string; // REFerrer
	inskin: TrueOrFalse; // InSkin
	amtgrp: AdManagerGroup;
	s: string; // site Section

	// And more
	[_: string]: string | string[];
}>;

const AMTGRP_STORAGE_KEY = 'gu.adManagerGroup';

const findBreakpoint = (): 'mobile' | 'tablet' | 'desktop' => {
	const width = getViewport().width;
	switch (getTweakpoint(width)) {
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
	}
};

const skinsizeTargeting = () => {
	const vp = getViewport();
	return vp.width >= 1560 ? 'l' : 's';
};

// TODO - what does this mean if we now wait for consent state
const inskinTargeting = (): TrueOrFalse => {
	// Don’t show inskin if we cannot tell if a privacy message will be shown
	if (!cmp.hasInitialised()) return 'f';
	return cmp.willShowPrivacyMessageSync() ? 'f' : 't';
};

const getFrequencyValue = (): Frequency => {
	const visitCount: number = parseInt(
		storage.local.getRaw('gu.alreadyVisited') ?? '0',
		10,
	);

	if (visitCount <= 5) {
		return frequency[visitCount];
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

	return '0';
};

const formatAppNexusTargeting = (obj: Record<string, string | string[]>) => {
	const asKeyValues = Object.entries(obj).map((entry) => {
		const [key, value] = entry;
		return Array.isArray(value)
			? value.map((nestedValue) => `${key}=${nestedValue}`)
			: `${key}=${value}`;
	});

	const flattenDeep = Array.prototype.concat.apply([], asKeyValues);
	return flattenDeep.join(',');
};

const buildAppNexusTargetingObject = once(
	(pageTargeting: PageTargeting): Record<string, string | string[]> =>
		removeFalseyValues({
			sens: pageTargeting.sens,
			pt1: pageTargeting.url,
			pt2: pageTargeting.edition,
			pt3: pageTargeting.ct,
			pt4: pageTargeting.p,
			pt5: pageTargeting.k,
			pt6: pageTargeting.su,
			pt7: pageTargeting.bp,
			pt9: [pageTargeting.pv, pageTargeting.co, pageTargeting.tn].join(
				'|',
			),
			permutive: pageTargeting.permutive,
		}),
);

const buildAppNexusTargeting = once((pageTargeting: PageTargeting): string =>
	formatAppNexusTargeting(buildAppNexusTargetingObject(pageTargeting)),
);

const consentedToAllPurposes = (consents: TCFv2ConsentList): boolean => {
	return (
		Object.keys(consents).length > 0 &&
		Object.values(consents).every(Boolean)
	);
};

const canTarget = (state?: ConsentState): boolean => {
	if (!state) return false;

	if (state.ccpa) {
		// CCPA mode
		return !state.ccpa.doNotSell;
	} else if (state.tcfv2) {
		// TCFv2 mode
		return consentedToAllPurposes(state.tcfv2.consents);
	} else if (state.aus) {
		// AUS mode
		return state.aus.personalisedAdvertising;
	}
	// Unknown mode
	return false;
};

const isAdManagerGroup = (s: string | null): s is AdManagerGroup =>
	adManagerGroups.some((g) => g === s);

const getAdManagerGroup = (consented = true): AdManagerGroup | null => {
	if (!consented) return null;
	const existingGroup = storage.local.getRaw(AMTGRP_STORAGE_KEY);

	return isAdManagerGroup(existingGroup)
		? existingGroup
		: createAdManagerGroup();
};

const createAdManagerGroup = (): AdManagerGroup => {
	const group =
		adManagerGroups[Math.floor(Math.random() * adManagerGroups.length)];
	storage.local.setRaw(AMTGRP_STORAGE_KEY, group);
	return group;
};

const filterEmptyValues = (pageTargets: Record<string, unknown>) => {
	const filtered: Record<string, string | string[]> = {};
	for (const key in pageTargets) {
		const value = pageTargets[key];
		if (isString(value)) {
			filtered[key] = value;
		} else if (
			Array.isArray(value) &&
			value.length > 0 &&
			value.every(isString)
		) {
			filtered[key] = value;
		}
	}
	return filtered;
};

const getConsentRelatedPageTargeting = (
	canTargetAds: boolean,
	consentState?: ConsentState,
): PageTargeting => {
	const amtgrp = consentState?.tcfv2
		? getAdManagerGroup(canTargetAds)
		: getAdManagerGroup();

	if (!consentState) {
		return {
			amtgrp,
			cmp_interaction: 'na',
			consent_tcfv2: 'na',
			pa: 'f',
			rdp: 'na',
		};
	}
	return {
		amtgrp,
		cmp_interaction: consentState.tcfv2
			? consentState.tcfv2.eventStatus
			: 'na',
		consent_tcfv2: consentState.tcfv2
			? consentedToAllPurposes(consentState.tcfv2.consents)
				? 't'
				: 'f'
			: 'na',
		pa: canTargetAds ? 't' : 'f',
		rdp: consentState.ccpa
			? consentState.ccpa.doNotSell
				? 't'
				: 'f'
			: 'na',
	};
};

const getPageTargeting = (consentState?: ConsentState): PageTargeting => {
	const canTargetAds = canTarget(consentState);
	if (!canTargetAds) clearPermutiveSegments();
	const consentRelatedTargeting = getConsentRelatedPageTargeting(
		canTargetAds,
		consentState,
	);
	const { page } = window.guardian.config;
	const adFreeTargeting: PageTargeting = commercialFeatures.adFree
		? { af: 't' }
		: {};

	const contentTargeting: ContentTargeting = getContentTargeting({
		eligibleForDCR:
			window.guardian.config.isDotcomRendering ||
			config.get<boolean>('page.dcrCouldRender', false),
		path: `/${page.pageId}`,
		renderingPlatform: window.guardian.config.isDotcomRendering
			? 'dotcom-rendering'
			: 'dotcom-platform',
		section: page.section,
		sensitive: page.isSensitive,
		videoLength: page.videoDuration,
	});

	const sessionTargeting: SessionTargeting = getSessionTargeting({
		adTest: getCookie({ name: 'adtest', shouldMemoize: true }),
		countryCode: getCountryCode(),
		isSignedIn: isUserLoggedIn(),
		pageViewId: window.guardian.config.ophan.pageViewId,
		participations: {
			clientSideParticipations: getSynchronousParticipations(),
			serverSideParticipations: window.guardian.config.tests ?? {},
		},
		referrer: detectGetReferrer(),
	});

	const pageTargets: PageTargeting = {
		bp: findBreakpoint(),
		fr: getFrequencyValue(),
		inskin: inskinTargeting(),
		permutive: getPermutiveSegments(),
		skinsize: skinsizeTargeting(),
		...consentRelatedTargeting,
		...page.sharedAdTargeting,
		...adFreeTargeting,
		...contentTargeting,
		...sessionTargeting,
	};

	// filter out empty values
	const pageTargeting: Record<string, string | string[]> =
		filterEmptyValues(pageTargets);

	// third-parties wish to access our page targeting, before the googletag script is loaded.
	page.appNexusPageTargeting = buildAppNexusTargeting(pageTargeting);

	// This can be removed once we get sign-off from third parties who prefer to use appNexusPageTargeting.
	page.pageAdTargeting = pageTargeting;

	log('commercial', 'pageTargeting object:', pageTargeting);

	return pageTargeting;
};

export {
	getPageTargeting,
	buildAppNexusTargeting,
	buildAppNexusTargetingObject,
};
