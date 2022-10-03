import type {
	ContentTargeting,
	SessionTargeting,
	SharedTargeting,
	ViewportTargeting,
} from '@guardian/commercial-core';
import {
	getContentTargeting,
	getPersonalisedTargeting,
	getSessionTargeting,
	getSharedTargeting,
	getViewportTargeting,
} from '@guardian/commercial-core';
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

export type PageTargeting = PartialWithNulls<
	{
		ab: string[];
		af: 't'; // Ad Free
		amtgrp: AdManagerGroup;
		at: string; // Ad Test
		bp: 'mobile' | 'tablet' | 'desktop'; // BreakPoint
		cc: CountryCode; // Country Code
		cmp_interaction: string;
		consent_tcfv2: string;
		dcre: TrueOrFalse; // DotCom-Rendering Eligible
		fr: Frequency; // FRequency
		inskin: TrueOrFalse; // InSkin
		pa: TrueOrFalse; // Personalised Ads consent
		permutive: string[]; // predefined segment values
		pv: string; // ophan Page View id
		rdp: string;
		ref: string; // REFerrer
		rp: 'dotcom-rendering' | 'dotcom-platform'; // Rendering Platform
		s: string; // site Section
		sens: TrueOrFalse; // SenSitive
		si: TrueOrFalse; // Signed In
		skinsize: 'l' | 's';
		urlkw: string[]; // URL KeyWords
		vl: string; // Video Length

		// And more
		[_: string]: string | string[];
	} & SharedTargeting
>;

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

// TODO rename to getConsentedTargeting
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

	const sharedAdTargeting = page.sharedAdTargeting
		? // asserting here as we can't import the type into global.d.ts
		  getSharedTargeting(page.sharedAdTargeting as Partial<SharedTargeting>)
		: {};

	const personalisedTargeting = getPersonalisedTargeting(consentState);

	const pageTargets: PageTargeting = {
		...personalisedTargeting,
		...sharedAdTargeting,
		...adFreeTargeting,
		...contentTargeting,
		...sessionTargeting,
		...viewportTargeting,
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

const consentlessTargetingKeys = [
	'ab',
	'at',
	'bl',
	'bp',
	'br',
	'category',
	'cc',
	'ct',
	'dcre',
	'edition',
	'isbn',
	'k',
	'refreshed',
	'rp',
	's',
	'se',
	'sens',
	'sh',
	'si',
	'skinsize',
	'slot',
	'slot-fabric',
	'su',
	'tn',
	'url',
	'urlkw',
] as const;

type ConsentlessTargetingKeys = typeof consentlessTargetingKeys[number];

type ConsentlessPageTargeting = Partial<
	Pick<PageTargeting, ConsentlessTargetingKeys>
>;

const isConsentlessKey = (key: unknown): key is ConsentlessTargetingKeys => {
	return consentlessTargetingKeys.includes(key as ConsentlessTargetingKeys);
};

const getConsentlessPageTargeting = (
	consentState: ConsentState,
): ConsentlessPageTargeting => {
	const consentedPageTargeting: PageTargeting =
		getPageTargeting(consentState);

	// filter consentedPageTargeting to only include consentless keys.
	// A more straightforward way to do this would be to loop through
	// consentedPageTargeting and only include keys that are in
	// consentlessTargetingKeys. This causes type errors since TypeScript can't
	// verify that the values are of the correct type.
	// We use reduce to get around this.
	const consentlessPageTargeting: ConsentlessPageTargeting = Object.entries(
		consentedPageTargeting,
	).reduce(
		(consentlessPageTargeting, [key, value]) =>
			isConsentlessKey(key)
				? { ...consentlessPageTargeting, [key]: value }
				: consentlessPageTargeting,
		{},
	);

	return consentlessPageTargeting;
};

export {
	getPageTargeting,
	getConsentlessPageTargeting,
	buildAppNexusTargeting,
	buildAppNexusTargetingObject,
};
