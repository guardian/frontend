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
	get: jest.fn((key: string) => {
		if (key === 'page.adUnit') {
			return 'adunit';
		}
		if (key === 'isDotcomRendering') {
			return false;
		}
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
		}),
	),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
	commercialFeatures: jest.fn(),
}));

jest.mock('common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(),
}));

const stateTcfv2 = (canTarget: boolean): ConsentState => ({
	tcfv2: {
		consents: { 1: canTarget, 2: canTarget, 3: canTarget },
		gdprApplies: true,
		eventStatus: 'tcloaded',
		vendorConsents: { abc: true },
		tcString: 'testTcString',
		addtlConsent: 'testaddtlConsent',
	},
});

const stateCcpa = (canTarget: boolean): ConsentState => ({
	ccpa: {
		doNotSell: !canTarget,
	},
});

const stateAus = (canTarget: boolean): ConsentState => ({
	aus: {
		personalisedAdvertising: canTarget,
	},
});

describe('create ads config', () => {
	it('disables ads in ad-free', () => {
		const result = youtubePlayer.createAdsConfig(
			true, // ad-free
			{},
		);

		expect(result.disableAds).toBeTruthy();
	});

	it('does not disable ads when we are not in ad-free', () => {
		const result = youtubePlayer.createAdsConfig(false, stateTcfv2(true));
		expect(result.disableAds).toBeUndefined();
	});

	it('in non ad-free, returns adsConfig without consent in TCF', () => {
		const result = youtubePlayer.createAdsConfig(false, stateTcfv2(false));
		expect(result.restrictedDataProcessor).toBeUndefined();
		expect(result.nonPersonalizedAd).toBeTruthy();
	});

	it('in non ad-free, returns adsConfig with consent in TCF', () => {
		const result = youtubePlayer.createAdsConfig(false, stateTcfv2(true));
		expect(result.restrictedDataProcessor).toBeUndefined();
		expect(result.nonPersonalizedAd).toBeFalsy();
	});

	it('in non ad-free, returns adsConfig without consent in CCPA', () => {
		const result = youtubePlayer.createAdsConfig(false, stateCcpa(false));
		expect(result.restrictedDataProcessor).toBeTruthy();
		expect(result.nonPersonalizedAd).toBeUndefined();
	});

	it('in non ad-free, returns adsConfig with consent in CCPA', () => {
		const result = youtubePlayer.createAdsConfig(false, stateCcpa(true));
		expect(result.restrictedDataProcessor).toBeFalsy();
		expect(result.nonPersonalizedAd).toBeUndefined();
	});

	it('in non ad-free, returns adsConfig without consent in aus', () => {
		const result = youtubePlayer.createAdsConfig(false, stateAus(false));
		expect(result.restrictedDataProcessor).toBeTruthy();
		expect(result.nonPersonalizedAd).toBeUndefined();
	});

	it('in non ad-free, returns adsConfig with consent in aus', () => {
		const result = youtubePlayer.createAdsConfig(false, stateAus(true));
		expect(result.restrictedDataProcessor).toBeFalsy();
		expect(result.nonPersonalizedAd).toBeUndefined();
	});

	it('in non ad-free includes adUnit', () => {
		const result = youtubePlayer.createAdsConfig(false, stateCcpa(true));

		expect(result.adTagParameters).toBeDefined();
		if (result.adTagParameters) {
			expect(result.adTagParameters.iu).toEqual('adunit');
		}
	});

	it('in non ad-free includes url-escaped and tcfv2 targeting params', () => {
		const result = youtubePlayer.createAdsConfig(false, stateTcfv2(true));
		const expectedAdTargetingParams = {
			cmpGdpr: 1,
			cmpGvcd: 'testaddtlConsent',
			cmpVcd: 'testTcString',
			cust_params: 'key%3Dvalue%26permutive%3D42',
			iu: 'adunit',
		};
		expect(result.adTagParameters).toBeDefined();
		if (result.adTagParameters) {
			expect(result.adTagParameters).toEqual(expectedAdTargetingParams);
		}
	});
});
