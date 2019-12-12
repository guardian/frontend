// @flow

import config from 'lib/config';
import { isGoogleProxy } from 'lib/detect';
import a9 from 'commercial/modules/header-bidding/a9/a9';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { isInVariantSynchronous as isInVariantSynchronous_ } from 'common/modules/experiments/ab';
import { _ } from './prepare-a9';

const { setupA9 } = _;
const isInVariantSynchronous: any = isInVariantSynchronous_;

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {},
}));

jest.mock('commercial/modules/header-bidding/a9/a9', () => ({
    initialise: jest.fn(),
}));

jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('lib/a9-apstag', () => jest.fn());

jest.mock('common/modules/commercial/build-page-targeting', () => ({
    buildPageTargeting: jest.fn(),
}));

jest.mock('commercial/modules/header-bidding/prebid/bid-config', () => ({
    isInVariant: jest.fn(),
}));

jest.mock('commercial/modules/header-bidding/utils', () => ({
    isInUsRegion: () => true,
}));

jest.mock('lib/load-script', () => ({
    loadScript: () => Promise.resolve(),
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
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
        isInVariantSynchronous.mockImplementation(
            (testId, variantId) => variantId === 'variant'
        );
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should initialise A9 when A9 switch is ON and advertising is on and ad-free is off', async () => {
        dfpEnv.hbImpl = { a9: true, prebid: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        isInVariantSynchronous.mockImplementation(
            (testId, variantId) => variantId === 'variant'
        );
        await setupA9();
        expect(a9.initialise).toBeCalled();
    });

    it('should initialise A9 when both prebid and a9 switches are ON and advertising is on and ad-free is off', async () => {
        dfpEnv.hbImpl = { a9: true, prebid: true };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        await setupA9();
        expect(a9.initialise).toBeCalled();
    });

    it('should not initialise A9 when useragent is Google Web Preview', async () => {
        fakeUserAgent('Google Web Preview');
        await setupA9();
        expect(a9.initialise).not.toBeCalled();
    });

    it('should not initialise A9 when no external demand', async () => {
        dfpEnv.hbImpl = { a9: false, prebid: false };
        await setupA9();
        expect(a9.initialise).not.toBeCalled();
    });

    it('should not initialise a9 when advertising is switched off', async () => {
        commercialFeatures.dfpAdvertising = false;
        await setupA9();
        expect(a9.initialise).not.toBeCalled();
    });

    it('should not initialise a9 when ad-free is on', async () => {
        commercialFeatures.adFree = true;
        await setupA9();
        expect(a9.initialise).not.toBeCalled();
    });

    it('should not initialise a9 when the page has a pageskin', async () => {
        dfpEnv.hbImpl = { a9: true, prebid: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        config.set('page.hasPageSkin', true);
        await setupA9();
        expect(a9.initialise).not.toBeCalled();
    });

    it('should initialise a9 when the page has no pageskin', async () => {
        dfpEnv.hbImpl = { a9: true, prebid: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        config.set('page.hasPageSkin', false);
        await setupA9();
        expect(a9.initialise).toBeCalled();
    });

    it('isGoogleWebPreview should return false with no navigator or useragent', () => {
        expect(isGoogleProxy()).toBe(false);
    });

    it('isGoogleWebPreview should return false with no navigator or useragent', () => {
        fakeUserAgent('Firefox');
        expect(isGoogleProxy()).toBe(false);
    });

    it('isGoogleWebPreview should return true with Google Web Preview useragent', () => {
        fakeUserAgent('Google Web Preview');
        expect(isGoogleProxy()).toBe(true);
    });

    it('isGoogleWebPreview should return true with Google Web Preview useragent', () => {
        fakeUserAgent('googleweblight');
        expect(isGoogleProxy()).toBe(true);
    });
});
