// @flow
/* global jsdom */

import config from 'lib/config';
import { _, bids } from 'commercial/modules/prebid/bid-config';
import {
    getRandomIntInclusive as getRandomIntInclusive_,
    getBreakpointKey as getBreakpointKey_,
    shouldIncludeTrustX as shouldIncludeTrustX_,
    stripMobileSuffix as stripMobileSuffix_,
} from 'commercial/modules/prebid/utils';

import type { PrebidBidder, PrebidSize } from 'commercial/modules/prebid/types';

const getRandomIntInclusive: any = getRandomIntInclusive_;
const shouldIncludeTrustX: any = shouldIncludeTrustX_;
const stripMobileSuffix: any = stripMobileSuffix_;
const getBreakpointKey: any = getBreakpointKey_;

const {
    getAppNexusPlacementId,
    getDummyServerSideBidders,
    getIndexSiteId,
    getImprovePlacementId,
    getTrustXAdUnitId,
    indexExchangeBidders,
} = _;

jest.mock('common/modules/commercial/build-page-targeting', () => ({
    buildAppNexusTargeting: () => 'someTestAppNexusTargeting',
    buildPageTargeting: () => 'bla',
}));

jest.mock('common/modules/commercial/ad-prefs.lib', () => ({
    getAdConsentState: jest.fn(),
}));

jest.mock('./utils');

/* eslint-disable guardian-frontend/no-direct-access-config */
const resetConfig = () => {
    config.switches.prebidImproveDigital = true;
    config.switches.prebidIndexExchange = true;
    config.switches.prebidSonobi = true;
    config.switches.prebidS2sozone = true;
    config.switches.prebidTrustx = true;
    config.switches.prebidXaxis = true;
    config.ophan = { pageViewId: 'pvid' };
    config.page.contentType = 'Article';
    config.page.edition = 'UK';
};

describe('getAppNexusPlacementId', () => {
    beforeEach(() => {
        resetConfig();
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
    });

    const generateTestIds = (): Array<string> => {
        const prebidSizes: Array<Array<PrebidSize>> = [
            [[300, 250]],
            [[300, 600]],
            [[970, 250]],
            [[728, 90]],
            [[1, 2]],
        ];
        return prebidSizes.map(getAppNexusPlacementId);
    };

    test('should return the expected values when on UK Edition and desktop device', () => {
        getBreakpointKey.mockReturnValue('D');
        expect(generateTestIds()).toEqual([
            '13366606',
            '13366606',
            '13366615',
            '13366615',
            '13144370',
        ]);
    });

    test('should return the expected values when on UK Edition and tablet device', () => {
        getBreakpointKey.mockReturnValue('T');
        expect(generateTestIds()).toEqual([
            '13366913',
            '13144370',
            '13144370',
            '13366916',
            '13144370',
        ]);
    });

    test('should return the expected values when on UK Edition and mobile device', () => {
        getBreakpointKey.mockReturnValue('M');
        expect(generateTestIds()).toEqual([
            '13366904',
            '13144370',
            '13144370',
            '13144370',
            '13144370',
        ]);
    });

    test('should return the default value on all other editions', () => {
        const editions = ['AU', 'US', 'INT'];
        const expected = [
            '13144370',
            '13144370',
            '13144370',
            '13144370',
            '13144370',
        ];

        editions.forEach(edition => {
            config.page.edition = edition;
            expect(generateTestIds()).toEqual(expected);
        });
    });
});

describe('getDummyServerSideBidders', () => {
    beforeEach(() => {
        getRandomIntInclusive.mockReturnValue(1);
        config.switches.prebidS2sozone = true;
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
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

describe('getImprovePlacementId', () => {
    beforeEach(() => {
        getBreakpointKey.mockReturnValue('D');
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
    });

    const generateTestIds = (): Array<number> => {
        const prebidSizes: Array<Array<PrebidSize>> = [
            [[300, 250]],
            [[300, 600]],
            [[970, 250]],
            [[728, 90]],
            [[1, 2]],
        ];
        return prebidSizes.map(getImprovePlacementId);
    };

    test('should return -1 if no cases match', () => {
        expect(getImprovePlacementId([[1, 2]])).toBe(-1);
    });

    test('should return the expected values when on the UK Edition and desktop device', () => {
        getBreakpointKey.mockReturnValue('D');
        expect(generateTestIds()).toEqual([
            1116396,
            1116396,
            1116397,
            1116397,
            -1,
        ]);
    });

    test('should return the expected values when on the UK Edition and tablet device', () => {
        getBreakpointKey.mockReturnValue('T');
        expect(generateTestIds()).toEqual([
            1116398,
            1116398,
            1116399,
            1116399,
            -1,
        ]);
    });

    test('should return the expected values when on the UK Edition and mobile device', () => {
        getBreakpointKey.mockReturnValue('M');
        expect(generateTestIds()).toEqual([1116400, 1116400, -1, -1, -1]);
    });

    test('should return the expected values when on the INT Edition and desktop device', () => {
        config.page.edition = 'INT';
        getBreakpointKey.mockReturnValue('D');
        expect(generateTestIds()).toEqual([
            1116420,
            1116420,
            1116421,
            1116421,
            -1,
        ]);
    });

    test('should return the expected values when on the INT Edition and tablet device', () => {
        config.page.edition = 'INT';
        getBreakpointKey.mockReturnValue('T');
        expect(generateTestIds()).toEqual([
            1116422,
            1116422,
            1116423,
            1116423,
            -1,
        ]);
    });

    test('should return the expected values when on the INT Edition and mobile device', () => {
        config.page.edition = 'INT';
        getBreakpointKey.mockReturnValue('M');
        expect(generateTestIds()).toEqual([1116424, 1116424, -1, -1, -1]);
    });

    test('should return -1 if on the US or AU Editions', () => {
        config.page.edition = 'AU';
        expect(generateTestIds()).toEqual([-1, -1, -1, -1, -1]);
        config.page.edition = 'US';
        expect(generateTestIds()).toEqual([-1, -1, -1, -1, -1]);
    });
});

describe('getTrustXAdUnitId', () => {
    beforeEach(() => {
        getBreakpointKey.mockReturnValue('D');
        stripMobileSuffix.mockImplementation(str => str);
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
    });

    test('should return the expected value for dfp-ad--comments', () => {
        expect(getTrustXAdUnitId('dfp-ad--comments', true)).toBe('3840');
    });

    test('should return the expected values for dfp-ad--inline10', () => {
        expect(getTrustXAdUnitId('dfp-ad--inline10', true)).toBe('3840');
        expect(getTrustXAdUnitId('dfp-ad--inline10', false)).toBe('3841');
    });
});

describe('indexExchangeBidders', () => {
    beforeEach(() => {
        getBreakpointKey.mockReturnValue('D');
        config.page.pbIndexSites = [
            { bp: 'D', id: 123456 },
            { bp: 'M', id: 234567 },
            { bp: 'T', id: 345678 },
        ];
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
    });

    test('should return an IX bidder for every size that the slot can take', () => {
        const slotSizes: Array<PrebidSize> = [[300, 250], [300, 600]];
        const bidders: Array<PrebidBidder> = indexExchangeBidders(slotSizes);
        expect(bidders).toEqual([
            expect.objectContaining({
                name: 'ix',
                bidParams: expect.any(Function),
            }),
            expect.objectContaining({
                name: 'ix',
                bidParams: expect.any(Function),
            }),
        ]);
    });

    test('should include methods in the response that generate the correct bid params', () => {
        const slotSizes: Array<PrebidSize> = [[300, 250], [300, 600]];
        const bidders: Array<PrebidBidder> = indexExchangeBidders(slotSizes);
        expect(bidders[0].bidParams('type', [[1, 2]])).toEqual({
            siteId: '123456',
            size: [300, 250],
        });
        expect(bidders[1].bidParams('type', [[1, 2]])).toEqual({
            siteId: '123456',
            size: [300, 600],
        });
    });
});

describe('getIndexSiteId', () => {
    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
    });

    test('should return an empty string if pbIndexSites is empty', () => {
        config.page.pbIndexSites = [];
        getBreakpointKey.mockReturnValue('D');
        expect(getIndexSiteId()).toBe('');
        expect(getIndexSiteId().length).toBe(0);
    });

    test('should find the correct ID for the breakpoint', () => {
        config.page.pbIndexSites = [
            { bp: 'D', id: 123456 },
            { bp: 'M', id: 234567 },
            { bp: 'T', id: 345678 },
        ];
        const breakpoints = ['M', 'D', 'M', 'T', 'D'];
        const results = [];
        for (let i = 0; i < breakpoints.length; i += 1) {
            getBreakpointKey.mockReturnValue(breakpoints[i]);
            results.push(getIndexSiteId());
        }
        expect(results).toEqual([
            '234567',
            '123456',
            '234567',
            '345678',
            '123456',
        ]);
    });
});

describe('bids', () => {
    beforeEach(() => {
        getRandomIntInclusive.mockReturnValue(5);
        shouldIncludeTrustX.mockReturnValue(false);
        stripMobileSuffix.mockImplementation(str => str);
        resetConfig();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jsdom.reconfigure({
            url: 'https://some.domain/path',
        });
    });

    const setQueryString = (s: string) => {
        jsdom.reconfigure({
            url: `https://some.domain/path?${s}`,
        });
    };

    const bidders = () =>
        bids('dfp-ad--top-above-nav', [[728, 90]]).map(bid => bid.bidder);

    test('should only include bidders that are switched on if no bidders being tested', () => {
        config.switches.prebidXaxis = false;
        getRandomIntInclusive.mockReturnValue(1);
        expect(bidders()).toEqual([
            'ix',
            'sonobi',
            'improvedigital',
            'openx',
            'appnexus',
        ]);
    });

    test('should not include Ozone bidders when fate is against them', () => {
        config.switches.prebidXaxis = false;
        expect(bidders()).toEqual(['ix', 'sonobi', 'improvedigital']);
    });

    test('should not include ix bidders when switched off', () => {
        config.switches.prebidIndexExchange = false;
        expect(bidders()).toEqual(['sonobi', 'improvedigital', 'xhb']);
    });

    test('should include TrustX if in target geolocation', () => {
        shouldIncludeTrustX.mockReturnValue(true);
        expect(bidders()).toEqual([
            'ix',
            'sonobi',
            'trustx',
            'improvedigital',
            'xhb',
        ]);
    });

    test('should include ix bidder for each size that slot can take', () => {
        const rightSlotBidders = () =>
            bids('dfp-right', [[300, 600], [300, 250]]).map(bid => bid.bidder);
        expect(rightSlotBidders()).toEqual([
            'ix',
            'ix',
            'sonobi',
            'improvedigital',
            'xhb',
        ]);
    });

    test('should only include bidder being tested', () => {
        setQueryString('pbtest=xhb');
        expect(bidders()).toEqual(['xhb']);
    });

    test('should only include bidder being tested, even when its switch is off', () => {
        setQueryString('pbtest=xhb');
        config.switches.prebidXaxis = false;
        expect(bidders()).toEqual(['xhb']);
    });

    test('should only include multiple bidders being tested, even when their switches are off', () => {
        setQueryString('pbtest=xhb&pbtest=sonobi');
        config.switches.prebidXaxis = false;
        config.switches.prebidSonobi = false;
        expect(bidders()).toEqual(['sonobi', 'xhb']);
    });

    test('should ignore bidder that does not exist', () => {
        setQueryString('pbtest=nonexistentbidder&pbtest=xhb');
        expect(bidders()).toEqual(['xhb']);
    });
});
