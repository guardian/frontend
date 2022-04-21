import type {
	AdsConfigCCPAorAus,
	AdsConfigTCFV2,
} from '@guardian/commercial-core/dist/cjs/types';
import type {
	Callback,
	ConsentState,
} from '@guardian/consent-management-platform/dist/types';
import { _ as youtubePlayer } from 'common/modules/atoms/youtube-player';

jest.mock('common/modules/commercial/build-page-targeting', () => ({
	getPageTargeting: jest.fn(() => ({ key: 'value' })),
}));

jest.mock('@guardian/commercial-core', () => ({
	...jest.requireActual('@guardian/commercial-core'),
	getPermutivePFPSegments: jest.fn(() => [42]),
}));

jest.mock('lib/config', () => ({
	get: jest.fn((key: string, fallback?: unknown) => {
		if (key === 'page.adUnit') {
			return 'adunit';
		}
		if (key === 'isDotcomRendering') {
			return false;
		}

		if (fallback) return fallback;

		throw new Error(
			`Unexpected config lookup '${key}', check the mock is still correct`,
		);
	}),
}));

jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: jest.fn((callback: Callback) =>
		callback({
			tcfv2: {
				consents: { 1: true },
				gdprApplies: true,
				eventStatus: 'tcloaded',
				vendorConsents: { abc: true },
				tcString: 'testTcString',
				addtlConsent: 'testaddtlConsent',
			},
			canTarget: true,
			framework: "tcfv2"
		}),
	),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
	commercialFeatures: jest.fn(),
}));

jest.mock('common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(),
}));

const canTargetTCFv2 = (canTarget: boolean): ConsentState => ({
	tcfv2: {
		consents: { 1: canTarget, 2: canTarget, 3: canTarget },
		gdprApplies: true,
		eventStatus: 'tcloaded',
		vendorConsents: { abc: true },
		tcString: 'testTcString',
		addtlConsent: 'testaddtlConsent',
	},
	canTarget: true,
	framework: "tcfv2"
});

const canTargetCCPA = (canTarget: boolean): ConsentState => ({
	ccpa: {
		doNotSell: !canTarget,
	},
	canTarget: canTarget,
	framework: "ccpa"
});

const canTargetAUS = (canTarget: boolean): ConsentState => ({
	aus: {
		personalisedAdvertising: canTarget,
	},
	canTarget: canTarget,
	framework: "aus"
});

describe('create ads config', () => {
	it('disables ads in ad-free', () => {
		const result = youtubePlayer.createAdFreeConfig();

		expect(result.disableAds).toBe(true);
	});

	it('does not disable ads when we are not in ad-free', () => {
		const result = youtubePlayer.createAdsConfig(canTargetTCFv2(true));
		//@ts-expect-error -- we’re testing TS’s safety, here!
		expect(result.disableAds).toBeUndefined();
	});

	it('in non ad-free, returns adsConfig without consent in TCF', () => {
		const result = youtubePlayer.createAdsConfig(
			canTargetTCFv2(false),
		) as AdsConfigTCFV2;
		//@ts-expect-error -- we’re testing TS’s safety, here!
		expect(result.restrictedDataProcessor).toBeUndefined();
		expect(result.nonPersonalizedAd).toBe(true);
	});

	it('in non ad-free, returns adsConfig with consent in TCF', () => {
		const result = youtubePlayer.createAdsConfig(
			canTargetTCFv2(true),
		) as AdsConfigTCFV2;
		//@ts-expect-error -- we’re testing TS’s safety, here!
		expect(result.restrictedDataProcessor).toBeUndefined();
		expect(result.nonPersonalizedAd).toBe(false);
	});

	it('in non ad-free, returns adsConfig without consent in CCPA', () => {
		const result = youtubePlayer.createAdsConfig(
			canTargetCCPA(false),
		) as AdsConfigCCPAorAus;
		expect(result.restrictedDataProcessor).toBe(true);
		//@ts-expect-error -- we’re testing TS’s safety, here!
		expect(result.nonPersonalizedAd).toBeUndefined();
	});

	it('in non ad-free, returns adsConfig with consent in CCPA', () => {
		const result = youtubePlayer.createAdsConfig(
			canTargetCCPA(true),
		) as AdsConfigCCPAorAus;
		expect(result.restrictedDataProcessor).toBe(false);
		//@ts-expect-error -- we’re testing TS’s safety, here!
		expect(result.nonPersonalizedAd).toBeUndefined();
	});

	it('in non ad-free, returns adsConfig without consent in aus', () => {
		const result = youtubePlayer.createAdsConfig(
			canTargetAUS(false),
		) as AdsConfigCCPAorAus;
		expect(result.restrictedDataProcessor).toBe(true);
		//@ts-expect-error -- we’re testing TS’s safety, here!
		expect(result.nonPersonalizedAd).toBeUndefined();
	});

	it('in non ad-free, returns adsConfig with consent in aus', () => {
		const result = youtubePlayer.createAdsConfig(
			canTargetAUS(true),
		) as AdsConfigCCPAorAus;
		expect(result.restrictedDataProcessor).toBe(false);
		//@ts-expect-error -- we’re testing TS’s safety, here!
		expect(result.nonPersonalizedAd).toBeUndefined();
	});

	it('in non ad-free includes adUnit', () => {
		const result = youtubePlayer.createAdsConfig(canTargetCCPA(true));

		expect(result.adTagParameters).toBeDefined();
		expect(result.adTagParameters.iu).toEqual('adunit');
	});

	it('in non ad-free includes url-escaped and tcfv2 targeting params', () => {
		const result = youtubePlayer.createAdsConfig(canTargetTCFv2(true));
		const expectedAdTargetingParams = {
			cmpGdpr: 1,
			cmpGvcd: 'testaddtlConsent',
			cmpVcd: 'testTcString',
			cust_params: 'key%3Dvalue%26permutive%3D42',
			iu: 'adunit',
		};
		expect(result.adTagParameters).toBeDefined();
		expect(result.adTagParameters).toEqual(expectedAdTargetingParams);
	});
});

describe('Get Host (no-cookie)', () => {
	test('`youtube-nocookie.com` with an empty state', () => {
		const host = youtubePlayer.getHost({
			state: {
				canTarget: false,
				framework: null
			},
			adFree: false,
			classes: ['youtube-media-atom__iframe'],
		});

		expect(host).toEqual('https://www.youtube-nocookie.com');
	});

	test('`youtube-nocookie.com` with an ad-free', () => {
		const host = youtubePlayer.getHost({
			state: {
				aus: { personalisedAdvertising: true },
				canTarget: true,
				framework: "aus"
			},
			adFree: true,
			classes: ['youtube-media-atom__iframe'],
		});

		expect(host).toEqual('https://www.youtube-nocookie.com');
	});

	test('`youtube-nocookie.com` with for other than youtube-media-atom__iframe', () => {
		const host = youtubePlayer.getHost({
			state: {
				aus: { personalisedAdvertising: true },
				canTarget: true,
				framework: "aus"
			},
			adFree: false,
			classes: ['not sure'],
		});

		expect(host).toEqual('https://www.youtube-nocookie.com');
	});

	test('`youtube.com` when all three conditions met', () => {
		const host = youtubePlayer.getHost({
			state: {
				aus: { personalisedAdvertising: true },
				canTarget: true,
				framework: "aus"
			},
			adFree: false,
			classes: ['youtube-media-atom__iframe'],
		});

		expect(host).toEqual('https://www.youtube.com');
	});
});
