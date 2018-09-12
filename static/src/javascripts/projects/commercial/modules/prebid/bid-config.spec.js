// @flow
/* global jsdom */

import config from 'lib/config';
import { commercialPrebidAdYouLike as CommercialPrebidAdYouLike } from 'common/modules/experiments/tests/commercial-prebid-adyoulike';
import {
    getParticipations as getParticipations_,
    getVariant as getVariant_,
    isInVariant as isInVariant_,
} from 'common/modules/experiments/utils';
import { _, bids } from './bid-config';
import type { PrebidBidder, PrebidSize } from './types';
import {
    containsBillboard as containsBillboard_,
    containsDmpu as containsDmpu_,
    containsLeaderboard as containsLeaderboard_,
    containsLeaderboardOrBillboard as containsLeaderboardOrBillboard_,
    containsMpu as containsMpu_,
    containsMpuOrDmpu as containsMpuOrDmpu_,
    getBreakpointKey as getBreakpointKey_,
    getRandomIntInclusive as getRandomIntInclusive_,
    shouldIncludeAdYouLike as shouldIncludeAdYouLike_,
    shouldIncludeAppNexus as shouldIncludeAppNexus_,
    shouldIncludeOpenx as shouldIncludeOpenx_,
    shouldIncludeTrustX as shouldIncludeTrustX_,
    stripMobileSuffix as stripMobileSuffix_,
} from './utils';

const containsBillboard: any = containsBillboard_;
const containsDmpu: any = containsDmpu_;
const containsLeaderboard: any = containsLeaderboard_;
const containsLeaderboardOrBillboard: any = containsLeaderboardOrBillboard_;
const containsMpu: any = containsMpu_;
const containsMpuOrDmpu: any = containsMpuOrDmpu_;
const getRandomIntInclusive: any = getRandomIntInclusive_;
const shouldIncludeAdYouLike: any = shouldIncludeAdYouLike_;
const shouldIncludeAppNexus: any = shouldIncludeAppNexus_;
const shouldIncludeOpenx: any = shouldIncludeOpenx_;
const shouldIncludeTrustX: any = shouldIncludeTrustX_;
const stripMobileSuffix: any = stripMobileSuffix_;
const getBreakpointKey: any = getBreakpointKey_;
const getParticipations: any = getParticipations_;
const getVariant: any = getVariant_;
const isInVariant: any = isInVariant_;

const {
    getAdYouLikePlacementId,
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

jest.mock('common/modules/experiments/utils');

/* eslint-disable guardian-frontend/no-direct-access-config */
const resetConfig = () => {
    config.set('switches.prebidAppnexus', true);
    config.set('switches.prebidOpenx', true);
    config.set('switches.prebidImproveDigital', true);
    config.set('switches.prebidIndexExchange', true);
    config.set('switches.prebidSonobi', true);
    config.set('switches.prebidS2sozone', true);
    config.set('switches.prebidTrustx', true);
    config.set('switches.prebidXaxis', true);
    config.set('switches.prebidAdYouLike', true);
    config.set('ophan', { pageViewId: 'pvid' });
    config.set('page.contentType', 'Article');
    config.set('page.edition', 'UK');
};

describe('getAppNexusPlacementId', () => {
    beforeEach(() => {
        resetConfig();
        window.OzoneLotameData = { some: 'lotamedata' };
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
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValue(false);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValue(false);
        expect(generateTestIds()).toEqual([
            '13366606',
            '13366606',
            '13366615',
            '13366615',
            '13915593',
        ]);
    });

    test('should return the expected values when on UK Edition and tablet device', () => {
        getBreakpointKey.mockReturnValue('T');
        containsMpu.mockReturnValueOnce(true);
        containsMpu.mockReturnValue(false);
        containsLeaderboard.mockReturnValueOnce(false);
        containsLeaderboard.mockReturnValueOnce(false);
        containsLeaderboard.mockReturnValueOnce(true);
        containsLeaderboard.mockReturnValue(false);
        expect(generateTestIds()).toEqual([
            '13366913',
            '13915593',
            '13915593',
            '13366916',
            '13915593',
        ]);
    });

    test('should return the expected values when on UK Edition and mobile device', () => {
        getBreakpointKey.mockReturnValue('M');
        containsMpu.mockReturnValueOnce(true);
        containsMpu.mockReturnValue(false);
        expect(generateTestIds()).toEqual([
            '13366904',
            '13915593',
            '13915593',
            '13915593',
            '13915593',
        ]);
    });

    test('should return the default value on all other editions', () => {
        const editions = ['AU', 'US', 'INT'];
        const expected = [
            '13915593',
            '13915593',
            '13915593',
            '13915593',
            '13915593',
        ];

        editions.forEach(edition => {
            config.set('page.edition', edition);
            expect(generateTestIds()).toEqual(expected);
        });
    });
});

describe('getDummyServerSideBidders', () => {
    beforeEach(() => {
        getRandomIntInclusive.mockReturnValue(1);
        config.set('switches.prebidS2sozone', true);
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
    });

    test('should return an empty array if the switch is off', () => {
        config.set('switches.prebidS2sozone', false);
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
        const appNexusParams = bidders[1].bidParams('type', [[1, 2]]);
        expect(openxParams).toEqual({
            delDomain: 'guardian-d.openx.net',
            unit: '539997090',
            lotame: { some: 'lotamedata' },
        });
        expect(appNexusParams).toEqual({
            placementId: '13915593',
            customData: 'someTestAppNexusTargeting',
            lotame: { some: 'lotamedata' },
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
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValue(false);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValue(false);
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
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValue(false);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValue(false);
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
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValue(false);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValue(false);
        expect(generateTestIds()).toEqual([1116400, 1116400, -1, -1, -1]);
    });

    test('should return the expected values when on the INT Edition and desktop device', () => {
        config.set('page.edition', 'INT');
        getBreakpointKey.mockReturnValue('D');
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValue(false);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValue(false);
        expect(generateTestIds()).toEqual([
            1116420,
            1116420,
            1116421,
            1116421,
            -1,
        ]);
    });

    test('should return the expected values when on the INT Edition and tablet device', () => {
        config.set('page.edition', 'INT');
        getBreakpointKey.mockReturnValue('T');
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValue(false);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValueOnce(true);
        containsLeaderboardOrBillboard.mockReturnValue(false);
        expect(generateTestIds()).toEqual([
            1116422,
            1116422,
            1116423,
            1116423,
            -1,
        ]);
    });

    test('should return the expected values when on the INT Edition and mobile device', () => {
        config.set('page.edition', 'INT');
        getBreakpointKey.mockReturnValue('M');
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValueOnce(true);
        containsMpuOrDmpu.mockReturnValue(false);
        expect(generateTestIds()).toEqual([1116424, 1116424, -1, -1, -1]);
    });

    test('should return -1 if on the US or AU Editions', () => {
        config.set('page.edition', 'AU');
        expect(generateTestIds()).toEqual([-1, -1, -1, -1, -1]);
        config.set('page.edition', 'US');
        expect(generateTestIds()).toEqual([-1, -1, -1, -1, -1]);
    });

    test('should use test placement ID when participating in CommercialPrebidSafeframe test in desktop MPU', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('D');
        containsMpu.mockReturnValue(true);
        expect(getImprovePlacementId([[300, 250]])).toEqual(1116407);
    });

    test('should use test placement ID when participating in CommercialPrebidSafeframe test in desktop DMPU', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('D');
        containsDmpu.mockReturnValue(true);
        expect(getImprovePlacementId([[300, 600]])).toEqual(1116408);
    });

    test('should use test placement ID when participating in CommercialPrebidSafeframe test in desktop billboard', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('D');
        containsLeaderboardOrBillboard.mockReturnValue(true);
        expect(getImprovePlacementId([[970, 250]])).toEqual(1116409);
    });

    test('should use test placement ID when participating in CommercialPrebidSafeframe test in desktop leaderboard', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('D');
        containsLeaderboardOrBillboard.mockReturnValue(true);
        expect(getImprovePlacementId([[728, 90]])).toEqual(1116409);
    });

    test('should use test placement ID when participating in CommercialPrebidSafeframe test in tablet MPU', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('T');
        containsMpu.mockReturnValue(true);
        expect(getImprovePlacementId([[300, 250]])).toEqual(1116410);
    });

    test('should use test placement ID when participating in CommercialPrebidSafeframe test in tablet leaderboard', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('T');
        containsLeaderboard.mockReturnValue(true);
        expect(getImprovePlacementId([[728, 90]])).toEqual(1116411);
    });

    test('should use test placement ID when participating in CommercialPrebidSafeframe test in mobile MPU', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('M');
        expect(getImprovePlacementId([[300, 250]])).toEqual(1116412);
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

describe('getAdYouLikePlacementId', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        resetConfig();
    });

    test('should serve expected style when in aylStyle variant', () => {
        getParticipations.mockReturnValue({
            CommercialPrebidAdYouLike: { variant: 'aylStyle' },
        });
        getVariant.mockReturnValue(CommercialPrebidAdYouLike.variants[0]);
        expect(getAdYouLikePlacementId()).toBe(
            '0da4f71dbe8e1af5c0e4739f53366020'
        );
    });

    test('should serve expected style when in guardianStyle variant', () => {
        getParticipations.mockReturnValue({
            CommercialPrebidAdYouLike: { variant: 'aylStyle' },
        });
        getVariant.mockReturnValue(CommercialPrebidAdYouLike.variants[1]);
        expect(getAdYouLikePlacementId()).toBe(
            '2b4d757e0ec349583ce704699f1467dd'
        );
    });
});

describe('indexExchangeBidders', () => {
    beforeEach(() => {
        getBreakpointKey.mockReturnValue('D');
        config.set('page.pbIndexSites', [
            { bp: 'D', id: 123456 },
            { bp: 'M', id: 234567 },
            { bp: 'T', id: 345678 },
        ]);
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
        config.set('page.pbIndexSites', []);
        getBreakpointKey.mockReturnValue('D');
        expect(getIndexSiteId()).toBe('');
        expect(getIndexSiteId().length).toBe(0);
    });

    test('should find the correct ID for the breakpoint', () => {
        config.set('page.pbIndexSites', [
            { bp: 'D', id: 123456 },
            { bp: 'M', id: 234567 },
            { bp: 'T', id: 345678 },
        ]);
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

    test('should use test site ID when participating in CommercialPrebidSafeframe test on desktop', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('D');
        expect(getIndexSiteId()).toEqual('287246');
    });

    test('should use test site ID when participating in CommercialPrebidSafeframe test on tablet', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('T');
        expect(getIndexSiteId()).toEqual('287247');
    });

    test('should use test site ID when participating in CommercialPrebidSafeframe test on mobile', () => {
        getVariant.mockReturnValue({
            id: 'variant',
            test: (): void => {},
        });
        isInVariant.mockReturnValue(true);
        getBreakpointKey.mockReturnValue('M');
        expect(getIndexSiteId()).toEqual('287248');
    });
});

describe('bids', () => {
    beforeEach(() => {
        containsBillboard.mockReturnValue(false);
        containsDmpu.mockReturnValue(false);
        containsLeaderboard.mockReturnValue(false);
        containsLeaderboardOrBillboard.mockReturnValue(false);
        containsMpu.mockReturnValue(false);
        containsMpuOrDmpu.mockReturnValue(false);
        getRandomIntInclusive.mockReturnValue(5);
        shouldIncludeAdYouLike.mockReturnValue(true);
        shouldIncludeAppNexus.mockReturnValue(false);
        shouldIncludeAppNexus.mockReturnValue(false);
        shouldIncludeTrustX.mockReturnValue(false);
        stripMobileSuffix.mockImplementation(str => str);
        getVariant.mockReturnValue(CommercialPrebidAdYouLike.variants[0]);
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
        config.set('switches.prebidXaxis', false);
        getRandomIntInclusive.mockReturnValue(1);
        expect(bidders()).toEqual([
            'ix',
            'sonobi',
            'improvedigital',
            'adyoulike',
            'openx',
            'appnexus',
        ]);
    });

    test('should not include Ozone bidders when fate is against them', () => {
        config.set('switches.prebidXaxis', false);
        expect(bidders()).toEqual([
            'ix',
            'sonobi',
            'improvedigital',
            'adyoulike',
        ]);
    });

    test('should not include ix bidders when switched off', () => {
        config.set('switches.prebidIndexExchange', false);
        expect(bidders()).toEqual([
            'sonobi',
            'improvedigital',
            'xhb',
            'adyoulike',
        ]);
    });

    test('should include AppNexus directly if in target geolocation', () => {
        shouldIncludeAppNexus.mockReturnValue(true);
        expect(bidders()).toEqual([
            'ix',
            'sonobi',
            'and',
            'improvedigital',
            'xhb',
            'adyoulike',
        ]);
    });

    test('should include OpenX directly if in target geolocation', () => {
        shouldIncludeOpenx.mockReturnValue(true);
        expect(bidders()).toEqual([
            'ix',
            'sonobi',
            'improvedigital',
            'xhb',
            'adyoulike',
            'oxd',
        ]);
    });

    test('should include TrustX if in target geolocation', () => {
        shouldIncludeTrustX.mockReturnValue(true);
        expect(bidders()).toEqual([
            'ix',
            'sonobi',
            'trustx',
            'improvedigital',
            'xhb',
            'adyoulike',
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
            'adyoulike',
        ]);
    });

    test('should only include bidder being tested', () => {
        setQueryString('pbtest=xhb');
        expect(bidders()).toEqual(['xhb']);
    });

    test('should only include bidder being tested, even when its switch is off', () => {
        setQueryString('pbtest=xhb');
        config.set('switches.prebidXaxis', false);
        expect(bidders()).toEqual(['xhb']);
    });

    test('should only include multiple bidders being tested, even when their switches are off', () => {
        setQueryString('pbtest=xhb&pbtest=sonobi');
        config.set('switches.prebidXaxis', false);
        config.set('switches.prebidSonobi', false);
        expect(bidders()).toEqual(['sonobi', 'xhb']);
    });

    test('should ignore bidder that does not exist', () => {
        setQueryString('pbtest=nonexistentbidder&pbtest=xhb');
        expect(bidders()).toEqual(['xhb']);
    });
});
