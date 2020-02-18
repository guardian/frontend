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
    onIabConsentNotification: jest.fn(callback => callback({ '1': true })),
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
            false
        );

        expect(result.disableAds).toBeTruthy();
    });

    it('does not disable ads when we are not in ad-free', () => {
        const result = youtubePlayer.createAdsConfig(false, false);

        expect(result.disableAds).toBeFalsy();
    });

    it('in non ad-free, returns false nonPersonalizedAds without consent', () => {
        const result = youtubePlayer.createAdsConfig(false, false);

        if (result.hasOwnProperty('nonPersonalizedAd')) {
            expect(result.nonPersonalizedAd).toBeTruthy();
        }
    });

    it('in non ad-free, returns true nonPersonalizedAds with consent', () => {
        const result = youtubePlayer.createAdsConfig(
            false,
            true // consent
        );

        expect(result.nonPersonalizedAd).toBeFalsy();
    });

    it('in non ad-free includes adUnit', () => {
        const result = youtubePlayer.createAdsConfig(false, false);

        expect(result.adTagParameters.iu).toEqual('adunit');
    });

    it('in non ad-free includes url-escaped targeting params', () => {
        const result = youtubePlayer.createAdsConfig(false, false);

        expect(result.adTagParameters.cust_params).toEqual(
            'key%3Dvalue%26permutive%3D42'
        );
    });
});
