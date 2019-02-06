// @flow

import { prebid } from 'commercial/modules/prebid/prebid';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { init, _ } from './prepare-prebid';

const { isGoogleWebPreview } = _;

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {},
}));

jest.mock('commercial/modules/prebid/prebid');

jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('common/modules/commercial/build-page-targeting', () => ({
    buildPageTargeting: jest.fn(),
}));

jest.mock('commercial/modules/prebid/bid-config', () => ({
    isInVariant: jest.fn(),
}));

const fakeUserAgent = (userAgent: string): void => {
    Object.defineProperty(navigator, 'userAgent', {
        get() {
            return userAgent;
        },
        configurable: true,
    });
};

describe('init', () => {
    let mockInitialise;
    const originalUA = navigator.userAgent;

    beforeEach(() => {
        mockInitialise = jest.fn();
        (prebid: any).initialise = mockInitialise.bind(prebid);
        fakeUserAgent(originalUA);
    });

    it('should initialise Prebid when external demand is Prebid and advertising is on and ad-free is off', () => {
        dfpEnv.externalDemand = 'prebid';
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        init(jest.fn(), jest.fn());
        expect(mockInitialise).toBeCalled();
    });

    it('should initialise Prebid when useragent is not Google Web Preview', () => {
        dfpEnv.externalDemand = 'prebid';
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        init(jest.fn(), jest.fn());
        expect(mockInitialise).toBeCalled();
    });

    it('should not initialise Prebid when useragent is Google Web Preview', () => {
        fakeUserAgent('Google Web Preview');
        init(jest.fn(), jest.fn());
        expect(mockInitialise).not.toBeCalled();
    });

    it('should not initialise Prebid when no external demand', () => {
        dfpEnv.externalDemand = 'none';
        init(jest.fn(), jest.fn());
        expect(mockInitialise).not.toBeCalled();
    });

    it('should not initialise Prebid when advertising is switched off', () => {
        commercialFeatures.dfpAdvertising = false;
        init(jest.fn(), jest.fn());
        expect(mockInitialise).not.toBeCalled();
    });

    it('should not initialise Prebid when ad-free is on', () => {
        commercialFeatures.adFree = true;
        init(jest.fn(), jest.fn());
        expect(mockInitialise).not.toBeCalled();
    });

    it('isGoogleWebPreview should return false with no navigator or useragent', () => {
        expect(isGoogleWebPreview()).toBe(false);
    });

    it('isGoogleWebPreview should return false with no navigator or useragent', () => {
        fakeUserAgent('Firefox');
        expect(isGoogleWebPreview()).toBe(false);
    });

    it('isGoogleWebPreview should return true with Google Web Preview useragent', () => {
        fakeUserAgent('Google Web Preview');
        expect(isGoogleWebPreview()).toBe(true);
    });
});
