// @flow

import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import {
    getConsentFor as getConsentFor_,
    onConsentChange as onConsentChange_
} from '@guardian/consent-management-platform';
import { isInAuOrNz as isInAuOrNz_ } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';
import { init, resetModule } from './redplanet';

const isInAuOrNz: any = isInAuOrNz_;

const tcfv2WithConsentMock = (callback): void =>
    callback({
        tcfv2: { vendorConsents: { '5f199c302425a33f3f090f51': true } },
    });

const tcfv2WithoutConsentMock = (callback): void =>
    callback({
        tcfv2: { vendorConsents: { '5f199c302425a33f3f090f51': false } },
    });

const onConsentChange: any = onConsentChange_;

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {},
}));

jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('common/modules/commercial/geo-utils');

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

jest.mock('lib/cookies', () => ({
    getCookie: jest.fn(),
}));

jest.mock('lib/launchpad', () => jest.fn());

jest.mock('common/modules/commercial/build-page-targeting', () => ({
    buildPageTargeting: jest.fn(),
}));

jest.mock('lib/load-script', () => ({
    loadScript: () => Promise.resolve(),
}));

jest.mock('@guardian/consent-management-platform', () => ({
    onConsentChange: jest.fn(),
    getConsentFor: jest.fn()
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

const CcpaWithConsentMock = (callback): void =>
    callback({ ccpa: { doNotSell: false } });

const getConsentFor: any = getConsentFor_;

window.launchpad = jest.fn().mockImplementationOnce(() => jest.fn());

describe('init', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetModule();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should initialise redplanet when all conditions are true with right params', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(true);
        config.set('ophan.browserId', '123');
        config.set('page.section', 'uk');
        config.set('page.sectionName', 'Politics');
        config.set('page.contentType', 'Article');
        onConsentChange.mockImplementation(tcfv2WithConsentMock);
        getConsentFor.mockReturnValue(true);

        await init();

        const expectedNewTrackerCall = [
            'newTracker',
            'launchpad',
            'lpx.qantas.com',
            {
                appId: 'the-guardian',
                discoverRootDomain: true,
            },
        ];
        const expectedTrackUnstructEventCall = [
            'trackUnstructEvent',
            {
                schema: 'iglu:com.qantas.launchpad/hierarchy/jsonschema/1-0-0',
                data: {
                    u1: 'theguardian.com',
                    u2: 'uk',
                    u3: 'Politics',
                    u4: 'Article',
                    uid: '123',
                },
            },
        ];
        expect(window.launchpad.mock.calls).toEqual([
            expectedNewTrackerCall,
            expectedTrackUnstructEventCall,
        ]);
    });

    it('should initialise redplanet when TCFv2 consent has been given', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(true);
        onConsentChange.mockImplementation(tcfv2WithConsentMock);
        getConsentFor.mockReturnValue(true);
        await init();
        expect(window.launchpad).toBeCalled();
    });

    it('should not initialise redplanet when TCFv2 consent has not been given', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(true);
        onConsentChange.mockImplementation(tcfv2WithoutConsentMock);
        getConsentFor.mockReturnValue(false);
        await init();
        expect(window.launchpad).not.toBeCalled();
    });

    it('should throw an error when on CCPA mode', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(true);
        onConsentChange.mockImplementation(CcpaWithConsentMock);
        getConsentFor.mockReturnValue(true);
        expect(await init).toThrow(
            `Error running Redplanet with CCPA (US CMP) present. It should only run in Australia on TCFv2 mode`
        );
    });

    it('should not initialise redplanet when launchpad conditions are false', async () => {
        commercialFeatures.launchpad = false;
        isInAuOrNz.mockReturnValue(true);
        onConsentChange.mockImplementation(tcfv2WithConsentMock);
        getConsentFor.mockReturnValue(true);
        await init();
        expect(window.launchpad).not.toBeCalled();
    });

    it('should not initialise redplanet when user not in AUS regions', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(false);
        onConsentChange.mockImplementation(tcfv2WithConsentMock);
        getConsentFor.mockReturnValue(true);
        await init();
        expect(window.launchpad).not.toBeCalled();
    });
});
