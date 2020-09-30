// @flow
import { _ as youtubePlayer } from 'common/modules/atoms/youtube-player';

jest.mock('common/modules/commercial/build-page-targeting', () => ({
    getPageTargeting: jest.fn(() => ({ key: 'value' })),
}));

jest.mock('common/modules/commercial/permutive', () => ({
    getPermutivePFPSegments: jest.fn(() => [42]),
}));

jest.mock('lib/config', () => ({
    get: jest.fn(key => {
        if (key === 'page.adUnit') {
            return 'adunit';
        }
        if (key === 'isDotcomRendering') {
            return false;
        }
        throw new Error(
            `Unexpected config lookup '${key}', check the mock is still correct`
        );
    }),
}));

jest.mock('@guardian/consent-management-platform', () => ({
    onConsentChange: jest.fn(callback =>
        callback({ tcfv2: { consents: { '1': true } } })
    ),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: jest.fn(),
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

describe('create ads config', () => {
    it('disables ads in ad-free', () => {
        const result = youtubePlayer.createAdsConfig(
            true, // ad-free
            null,
            null
        );

        expect(result.disableAds).toBeTruthy();
    });

    it('does not disable ads when we are not in ad-free', () => {
        const result = youtubePlayer.createAdsConfig(false, null, null);

        expect(result.disableAds).toBeFalsy();
    });

    it('in non ad-free, returns false nonPersonalizedAd without consent in TCF', () => {
        const result = youtubePlayer.createAdsConfig(false, false, null);

        if (result.hasOwnProperty('nonPersonalizedAd')) {
            expect(result.nonPersonalizedAd).toBeTruthy();
        }
    });

    it('in non ad-free, returns true nonPersonalizedAd with consent in TCF', () => {
        const result = youtubePlayer.createAdsConfig(false, true, null);

        expect(result.nonPersonalizedAd).toBeFalsy();
    });

    it('in non ad-free, returns no restrictedDataProcessor param in TCF', () => {
        const result = youtubePlayer.createAdsConfig(false, false, null);

        expect(result.restrictedDataProcessor).toBeUndefined();
    });

    it('in non ad-free, returns true restrictedDataProcessor without consent in CCPA', () => {
        const result = youtubePlayer.createAdsConfig(false, null, true);

        if (result.hasOwnProperty('restrictedDataProcessor')) {
            expect(result.restrictedDataProcessor).toBeTruthy();
        }
    });

    it('in non ad-free, returns false restrictedDataProcessor with consent in CCPA', () => {
        const result = youtubePlayer.createAdsConfig(false, null, false);

        if (result.hasOwnProperty('restrictedDataProcessor')) {
            expect(result.restrictedDataProcessor).toBeFalsy();
        }
    });

    it('in non ad-free, returns no nonPersonalizedAd param in CCPA', () => {
        const result = youtubePlayer.createAdsConfig(false, null, false);

        expect(result.nonPersonalizedAd).toBeUndefined();
    });

    it('in non ad-free includes adUnit', () => {
        const result = youtubePlayer.createAdsConfig(false, null, null);

        expect(result.adTagParameters).toBeDefined();
        if (result.adTagParameters) {
            expect(result.adTagParameters.iu).toEqual('adunit');
        }
    });

    it('in non ad-free includes url-escaped and tcfv2 targeting params', () => {
        const result = youtubePlayer.createAdsConfig(false, null, null);
        const expectedAdTargetingParams =  {
            "cmpGdpr": 1,
            "cmpGvcd": "testaddtlConsent",
            "cmpVcd": "testTcString",
            "cust_params": "key%3Dvalue%26permutive%3D42",
            "iu": "adunit"
        };
        expect(result.adTagParameters).toBeDefined();
        if (result.adTagParameters) {
            expect(result.adTagParameters).toEqual(expectedAdTargetingParams);
        }
    });
});
