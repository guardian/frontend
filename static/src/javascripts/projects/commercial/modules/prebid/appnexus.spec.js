// @flow
import config from 'lib/config';

import {
    _,
    getAppNexusDirectBidParams,
    getAppNexusServerSideBidParams,
} from './appnexus';

import type { PrebidSize } from './types';

import {
    getBreakpointKey as getBreakpointKey_,
    isInAuRegion as isInAuRegion_,
    isInUsRegion as isInUsRegion_,
} from './utils';

jest.mock('common/modules/commercial/build-page-targeting', () => ({
    buildAppNexusTargeting: () => 'someTestAppNexusTargeting',
    buildAppNexusTargetingObject: () => ({
        url: 'gu.com',
        sens: 'f',
        edition: 'UK',
    }),
    buildPageTargeting: () => 'pageTargeting',
}));

jest.mock('./utils', () => {
    // $FlowFixMe property requireActual is actually not missing Flow.
    const original = jest.requireActual('./utils');
    return {
        ...original,
        getBreakpointKey: jest.fn(),
        isInAuRegion: jest.fn(),
        isInUsRegion: jest.fn(),
    };
});

const {
    getAppNexusPlacementId,
    getAppNexusInvCode,
    getAppNexusDirectPlacementId,
} = _;

const getBreakpointKey: any = getBreakpointKey_;
const isInAuRegion: any = isInAuRegion_;
const isInUsRegion: any = isInUsRegion_;

/* eslint-disable guardian-frontend/no-direct-access-config */
const resetConfig = () => {
    config.set('switches.prebidAppnexus', true);
    config.set('switches.prebidAppnexusInvcode', false);
    config.set('ophan', { pageViewId: 'pvid' });
    config.set('page.contentType', 'Article');
    config.set('page.section', 'Magic');
    config.set('page.sectionName', 'More Magic');
    config.set('page.edition', 'UK');
};

describe('getAppNexusInvCode', () => {
    beforeEach(() => {
        resetConfig();
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
    });

    test('should return the magic strings for mobile breakpoints', () => {
        getBreakpointKey.mockReturnValue('M');
        const invCodes = [
            [[300, 250]],
            [[300, 600]],
            [[970, 250]],
            [[728, 90]],
        ].map(getAppNexusInvCode);

        expect(invCodes).toEqual([
            'Mmagic300x250',
            'Mmagic300x600',
            'Mmagic970x250',
            'Mmagic728x90',
        ]);
    });

    test('should return the magic strings for other breakpoints', () => {
        getBreakpointKey.mockReturnValueOnce('T');
        getBreakpointKey.mockReturnValueOnce('D');
        const invCodes = [
            [[300, 250]],
            [[300, 600]],
            [[970, 250]],
            [[728, 90]],
        ].map(getAppNexusInvCode);
        expect(invCodes).toEqual([
            'Dmagic300x250',
            'Dmagic300x600',
            'Dmagic970x250',
            'Dmagic728x90',
        ]);
    });

    test('should use sectionName, replacing whitespace with hyphens, when section is an empty string', () => {
        config.set('page.section', '');
        expect(getAppNexusInvCode([[300, 250]])).toEqual('Dmore-magic300x250');
    });
});

describe('getAppNexusDirectPlacementId', () => {
    beforeEach(() => {
        resetConfig();
        window.OzoneLotameData = { some: 'lotamedata' };
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
        window.OzoneLotameData = undefined;
    });

    const prebidSizes: Array<Array<PrebidSize>> = [
        [[300, 250]],
        [[300, 600]],
        [[970, 250]],
        [[728, 90]],
        [[1, 2]],
    ];

    test('should return the expected values when in AU region and desktop device', () => {
        expect(
            prebidSizes.map(size => getAppNexusDirectPlacementId(size, true))
        ).toEqual(['11016434', '11016434', '11016434', '11016434', '11016434']);
    });

    test('should return the expected values for ROW when on desktop device', () => {
        getBreakpointKey.mockReturnValue('D');
        expect(
            prebidSizes.map(size => getAppNexusDirectPlacementId(size, false))
        ).toEqual(['9251752', '9251752', '9926678', '9926678', '9251752']);
    });

    test('should return the expected values for ROW when on tablet device', () => {
        getBreakpointKey.mockReturnValue('T');
        expect(
            prebidSizes.map(size => getAppNexusDirectPlacementId(size, false))
        ).toEqual(['11600568', '9251752', '9251752', '11600778', '9251752']);
    });
});

describe('getAppNexusPlacementId', () => {
    beforeEach(() => {
        resetConfig();
        isInAuRegion.mockReturnValue(false);
        isInUsRegion.mockReturnValue(false);
        window.OzoneLotameData = { some: 'lotamedata' };
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
        window.OzoneLotameData = undefined;
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

    test('should return the expected values when on desktop device', () => {
        getBreakpointKey.mockReturnValue('D');
        expect(generateTestIds()).toEqual([
            '13366606',
            '13366606',
            '13366615',
            '13366615',
            '13915593',
        ]);
    });

    test('should return the expected values when on tablet device', () => {
        getBreakpointKey.mockReturnValue('T');
        expect(generateTestIds()).toEqual([
            '13366913',
            '13915593',
            '13915593',
            '13366916',
            '13915593',
        ]);
    });

    test('should return the expected values when on mobile device', () => {
        getBreakpointKey.mockReturnValue('M');
        expect(generateTestIds()).toEqual([
            '13366904',
            '13915593',
            '13915593',
            '13915593',
            '13915593',
        ]);
    });

    test('should return the default value if in US or AU regions', () => {
        getBreakpointKey.mockReturnValue('D');
        isInAuRegion.mockReturnValueOnce(true);
        isInUsRegion.mockReturnValueOnce(true);
        expect(getAppNexusPlacementId([[300, 250]])).toEqual('13915593');
        expect(getAppNexusPlacementId([[970, 250]])).toEqual('13915593');
        expect(getAppNexusPlacementId([[1, 2]])).toEqual('13915593');
    });
});

describe('getAppNexusServerSideBidParams', () => {
    beforeEach(() => {
        resetConfig();
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
        window.OzoneLotameData = undefined;
    });

    test('should include OzoneLotameData if available', () => {
        getBreakpointKey.mockReturnValue('M');
        window.OzoneLotameData = { some: 'lotamedata' };
        expect(getAppNexusServerSideBidParams([[300, 250]])).toEqual({
            keywords: { edition: 'UK', sens: 'f', url: 'gu.com' },
            placementId: '13366904',
            lotame: { some: 'lotamedata' },
        });
    });

    test('should excude lotame if data is unavailable', () => {
        getBreakpointKey.mockReturnValue('M');
        expect(getAppNexusServerSideBidParams([[300, 250]])).toEqual({
            keywords: { edition: 'UK', sens: 'f', url: 'gu.com' },
            placementId: '13366904',
        });
    });
});

describe('getAppNexusDirectBidParams', () => {
    beforeEach(() => {
        resetConfig();
    });

    afterEach(() => {
        jest.resetAllMocks();
        resetConfig();
    });

    test('should include placementId for AU region when invCode switch is off', () => {
        getBreakpointKey.mockReturnValue('M');
        expect(getAppNexusDirectBidParams([[300, 250]], true)).toEqual({
            keywords: { edition: 'UK', sens: 'f', url: 'gu.com' },
            placementId: '11016434',
        });
    });

    test('should exclude placementId for AU region when including member and invCode', () => {
        config.set('switches.prebidAppnexusInvcode', true);
        getBreakpointKey.mockReturnValue('M');
        expect(getAppNexusDirectBidParams([[300, 250]], true)).toEqual({
            keywords: {
                edition: 'UK',
                sens: 'f',
                url: 'gu.com',
                invc: ['Mmagic300x250'],
            },
            member: '7012',
            invCode: 'Mmagic300x250',
        });
    });

    test('should include placementId and not include invCode if outside AU region', () => {
        config.set('switches.prebidAppnexusInvcode', true);
        getBreakpointKey.mockReturnValue('M');
        expect(getAppNexusDirectBidParams([[300, 250]], false)).toEqual({
            keywords: { edition: 'UK', sens: 'f', url: 'gu.com' },
            placementId: '4298191',
        });
    });
});
