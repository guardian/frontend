import config from 'lib/config';
import { isGoogleProxy } from 'lib/detect';
import prebid from 'commercial/modules/header-bidding/prebid/prebid';
import {
    onConsentChange as onConsentChange_,
    getConsentFor as getConsentFor_,
} from '@guardian/consent-management-platform';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { _ } from './prepare-prebid';

const { setupPrebid } = _;
const onConsentChange = onConsentChange_;
const getConsentFor = getConsentFor_;

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {},
}));

jest.mock('commercial/modules/header-bidding/prebid/prebid', () => ({
    initialise: jest.fn(),
}));

jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('common/modules/commercial/build-page-targeting', () => ({
    getPageTargeting: jest.fn(),
}));

jest.mock('commercial/modules/header-bidding/prebid/bid-config', () => ({
    isInVariant: jest.fn(),
}));

jest.mock('commercial/modules/header-bidding/utils', () => ({
    shouldIncludeOnlyA9: false,
}));

jest.mock('@guardian/consent-management-platform', () => ({
    onConsentChange: jest.fn(),
    getConsentFor: jest.fn(),
}));

const tcfv2WithConsentMock = (callback) =>
    callback({
        tcfv2: { vendorConsents: { '5f22bfd82a6b6c1afd1181a9': true } },
    });

const tcfv2WithoutConsentMock = (callback) =>
    callback({
        tcfv2: { vendorConsents: { '5f22bfd82a6b6c1afd1181a9': false } },
    });

const ccpaWithConsentMock = (callback) =>
    callback({ ccpa: { doNotSell: false } });

const ccpaWithoutConsentMock = (callback) =>
    callback({ ccpa: { doNotSell: true } });

const ausWithConsentMock = (callback) =>
    callback({ aus: { rejectedCategories: [] } });

const ausWithoutConsentMock = (callback) =>
    callback({
        aus: {
            rejectedCategories: [
                { _id: '5f859c3420e4ec3e476c7006', name: 'Advertising' },
            ],
        },
    });

const fakeUserAgent = (userAgent) => {
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

    it('should initialise Prebid when Prebid switch is ON and advertising is on and ad-free is off', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        onConsentChange.mockImplementation(tcfv2WithConsentMock);
        getConsentFor.mockReturnValue(true);
        await setupPrebid();
        expect(prebid.initialise).toBeCalled();
    });

    it('should not initialise Prebid when useragent is Google Web Preview', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        fakeUserAgent('Google Web Preview');
        await setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should not initialise Prebid when no header bidding switches are on', async () => {
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        dfpEnv.hbImpl = { prebid: false, a9: false };
        await setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should not initialise Prebid when advertising is switched off', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = false;
        commercialFeatures.adFree = false;
        await setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should not initialise Prebid when ad-free is on', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = true;
        await setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should not initialise Prebid when the page has a pageskin', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        config.set('page.hasPageSkin', true);
        await setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should initialise Prebid when the page has no pageskin', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        config.set('page.hasPageSkin', false);
        await setupPrebid();
        expect(prebid.initialise).toBeCalled();
    });
    it('should initialise Prebid if TCFv2 consent with correct Sourcepoint Id is true ', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        onConsentChange.mockImplementation(tcfv2WithConsentMock);
        getConsentFor.mockReturnValue(true);
        await setupPrebid();
        expect(prebid.initialise).toBeCalled();
    });

    it('should not initialise Prebid if TCFv2 consent with correct Sourcepoint Id is false', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        onConsentChange.mockImplementation(tcfv2WithoutConsentMock);
        getConsentFor.mockReturnValue(false);
        await setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should initialise Prebid in CCPA if doNotSell is false', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        onConsentChange.mockImplementation(ccpaWithConsentMock);
        getConsentFor.mockReturnValue(true); // TODO: Why do we need to mock this?
        await setupPrebid();
        expect(prebid.initialise).toBeCalled();
    });

    it('should not initialise Prebid in CCPA if doNotSell is true', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        onConsentChange.mockImplementation(ccpaWithoutConsentMock);
        getConsentFor.mockReturnValue(false);
        await setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
    });

    it('should initialise Prebid in AUS if Advertising is not rejected', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        onConsentChange.mockImplementation(ausWithConsentMock);
        getConsentFor.mockReturnValue(true);
        await setupPrebid();
        expect(prebid.initialise).toBeCalled();
    });

    it('should not initialise Prebid in AUS if Advertising is rejected', async () => {
        dfpEnv.hbImpl = { prebid: true, a9: false };
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        onConsentChange.mockImplementation(ausWithoutConsentMock);
        getConsentFor.mockReturnValue(false);
        await setupPrebid();
        expect(prebid.initialise).not.toBeCalled();
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
