// @flow
import config from 'lib/config';
import { _ } from 'commercial/modules/prebid/bid-config';
import { getRandomIntInclusive as getRandomIntInclusive_ } from 'commercial/modules/prebid/utils';

import type { PrebidBidder } from 'commercial/modules/prebid/types';

const getRandomIntInclusive: any = getRandomIntInclusive_;
const { getDummyServerSideBidders } = _;

jest.mock('common/modules/commercial/build-page-targeting', () => ({
    buildAppNexusTargeting: () => 'someTestAppNexusTargeting',
    buildPageTargeting: () => 'bla',
}));

jest.mock('common/modules/commercial/ad-prefs.lib', () => ({
    getAdConsentState: jest.fn(),
}));

jest.mock('./utils', () => ({
    isExcludedGeolocation: jest.fn(() => false),
    getRandomIntInclusive: jest.fn(),
    getBreakpointKey: jest.fn(() => 'D'),
}));

jest.mock('lib/geolocation', () => ({
    getSync: jest.fn(() => 'GB'),
}));

/* eslint-disable guardian-frontend/no-direct-access-config */
describe('getDummyServerSideBidders', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        getRandomIntInclusive.mockReturnValue(1);
        config.switches.prebidS2sozone = true;
        config.page.edition = 'UK';
    });

    test('should return an empty array if the switch is off', () => {
        config.switches.prebidS2sozone = false;
        expect(getDummyServerSideBidders()).toEqual([]);
    });

    test('should return an empty array if outside the test sample', () => {
        getRandomIntInclusive.mockReturnValueOnce(3);
        expect(getDummyServerSideBidders()).toEqual([]);
    });

    test('should otherwise return the expected array of bidders', () => {
        const bidders: Array<PrebidBidder> = getDummyServerSideBidders();
        expect(bidders).toEqual([
            expect.objectContaining({
                name: 'openx',
                bidParams: expect.any(Function),
            }),
            expect.objectContaining({
                name: 'appnexus',
                bidParams: expect.any(Function),
            }),
        ]);
    });

    test('should include methods in the response that generate the correct bid params', () => {
        const bidders: Array<PrebidBidder> = getDummyServerSideBidders();
        const openxParams = bidders[0].bidParams('type', [[1, 2]]);
        const appnexusParams = bidders[1].bidParams('type', [[1, 2]]);
        expect(openxParams).toEqual({
            delDomain: 'guardian-d.openx.net',
            unit: '539997090',
        });
        expect(appnexusParams).toEqual({
            placementId: '13144370',
            customData: 'someTestAppNexusTargeting',
        });
    });
});
