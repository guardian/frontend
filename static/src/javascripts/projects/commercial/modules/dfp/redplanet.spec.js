// @flow

import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { onIabConsentNotification as onIabConsentNotification_ } from '@guardian/consent-management-platform';
import { isInAuOrNz as isInAuOrNz_ } from 'common/modules/commercial/geo-utils';
import { isInVariantSynchronous as isInVariantSynchronous_ } from 'common/modules/experiments/ab';
import config from 'lib/config';
import { init } from './redplanet';

const onIabConsentNotification: any = onIabConsentNotification_;
const isInAuOrNz: any = isInAuOrNz_;
const trueConsentMock = (callback): void =>
    callback({ '1': true, '2': true, '3': true, '4': true, '5': true });

const falseConsentMock = (callback): void =>
    callback({ '1': true, '2': true, '3': true, '4': true, '5': false });

const isInVariantSynchronous: any = isInVariantSynchronous_;

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
    onIabConsentNotification: jest.fn(),
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

window.launchpad = jest.fn().mockImplementationOnce(() => jest.fn());

describe('init', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
        onIabConsentNotification.mockImplementation(trueConsentMock);
        isInVariantSynchronous.mockImplementation(
            (testId, variantId) => variantId === 'variant'
        );

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

    it('should not initialise redplanet when user TCF consent has not been given', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(true);
        onIabConsentNotification.mockImplementation(falseConsentMock);
        await init();
        expect(window.launchpad).not.toBeCalled();
    });

    it('should not initialise redplanet when launchpad conditions are false', async () => {
        commercialFeatures.launchpad = false;
        isInAuOrNz.mockReturnValue(true);
        onIabConsentNotification.mockImplementation(trueConsentMock);
        await init();
        expect(window.launchpad).not.toBeCalled();
    });

    it('should not initialise redplanet when user not in AUS regions', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(false);
        onIabConsentNotification.mockImplementation(trueConsentMock);
        await init();
        expect(window.launchpad).not.toBeCalled();
    });
});
