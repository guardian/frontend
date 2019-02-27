// @flow

import prebid from 'commercial/modules/prebid/prebid';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { _ } from './prepare-prebid';

const { isGoogleWebPreview, setupPrebid } = _;

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {},
}));

jest.mock('commercial/modules/prebid/prebid', () => ({
    initialise: jest.fn(),
}));

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
    const userAgentObject = {};
    userAgentObject.get = () => userAgent;
    userAgentObject.configurable = true;
    Object.defineProperty(navigator, 'userAgent', userAgentObject);
};

describe('init', () => {
    const originalUA = navigator.userAgent;

    beforeEach(() => {
        jest.clearAllMocks();
        fakeUserAgent(originalUA);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should initialise Prebid when external demand is Prebid and advertising is on and ad-free is off', () => {
        dfpEnv.externalDemand = 'prebid';
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        setupPrebid();
        expect(prebid.initialise).toBeCalled();
    });

    it('should not initialise Prebid when useragent is Google Web Preview', () => {
        fakeUserAgent('Google Web Preview');
        setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should not initialise Prebid when no external demand', () => {
        dfpEnv.externalDemand = 'none';
        setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should not initialise Prebid when advertising is switched off', () => {
        commercialFeatures.dfpAdvertising = false;
        setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should not initialise Prebid when ad-free is on', () => {
        commercialFeatures.adFree = true;
        setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
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

    it('isGoogleWebPreview should return true with Google Web Preview useragent', () => {
        fakeUserAgent('googleweblight');
        expect(isGoogleWebPreview()).toBe(true);
    });
});
