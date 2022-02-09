import type {
	ContentTargeting,
	PersonalisedTargeting,
	SessionTargeting,
	ViewportTargeting,
} from '@guardian/commercial-core';
import {
	getContentTargeting,
	getPersonalisedTargeting,
	getSessionTargeting,
	getViewportTargeting,
} from '@guardian/commercial-core';
import { getContentTargeting } from '@guardian/commercial-core/dist/esm/targeting/content';
import type { ContentTargeting } from '@guardian/commercial-core/dist/esm/targeting/content';
import { cmp } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import type { CountryCode } from '@guardian/libs';
import { getCookie, isString, log } from '@guardian/libs';
import { once } from 'lodash-es';
import config from '../../../../lib/config';
import { getReferrer as detectGetReferrer } from '../../../../lib/detect';
import { getViewport } from '../../../../lib/detect-viewport';
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

const getPageTargeting = (consentState: ConsentState): PageTargeting => {
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

	const viewportTargeting: ViewportTargeting = getViewportTargeting({
		viewPortWidth: getViewport().width,
		cmpBannerWillShow:
			!cmp.hasInitialised() || cmp.willShowPrivacyMessageSync(),
	});

	const personalisedTargeting: PersonalisedTargeting =
		getPersonalisedTargeting(consentState);

	const pageTargets: PageTargeting = {
		...page.sharedAdTargeting,
		...adFreeTargeting,
		...contentTargeting,
		...sessionTargeting,
		...viewportTargeting,
		...personalisedTargeting,
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
