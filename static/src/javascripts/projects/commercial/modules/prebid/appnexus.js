// @flow strict

import config from 'lib/config';
import {
    buildPageTargeting,
    buildAppNexusTargetingObject,
} from 'common/modules/commercial/build-page-targeting';

import {
    getLargestSize,
    containsLeaderboard,
    containsLeaderboardOrBillboard,
    containsMpu,
    containsMpuOrDmpu,
    getBreakpointKey,
    isInAuRegion,
    isInUsRegion,
} from './utils';

import type { PrebidAppNexusParams, PrebidSize } from './types';

const getAppNexusInvCode = (sizes: Array<PrebidSize>): ?string => {
    const device: string = getBreakpointKey() === 'M' ? 'M' : 'D';
    const section: string = config.get('page.section', 'unknown');
    const slotSize: PrebidSize | null = getLargestSize(sizes);
    if (slotSize) {
        return `${device}${section.toLowerCase()}${slotSize.join('x')}`;
    }
};

export const getAppNexusPlacementId = (sizes: PrebidSize[]): string => {
    const defaultPlacementId: string = '13915593';
    if (isInUsRegion() || isInAuRegion()) {
        return defaultPlacementId;
    }
    switch (getBreakpointKey()) {
        case 'D':
            if (containsMpuOrDmpu(sizes)) {
                return '13366606';
            }
            if (containsLeaderboardOrBillboard(sizes)) {
                return '13366615';
            }
            return defaultPlacementId;
        case 'M':
            if (containsMpu(sizes)) {
                return '13366904';
            }
            return defaultPlacementId;
        case 'T':
            if (containsMpu(sizes)) {
                return '13366913';
            }
            if (containsLeaderboard(sizes)) {
                return '13366916';
            }
            return defaultPlacementId;
        default:
            return defaultPlacementId;
    }
};

export const getAppNexusDirectPlacementId = (
    sizes: PrebidSize[],
    isAuRegion: boolean
): string => {
    if (isAuRegion) {
        return '11016434';
    }

    const defaultPlacementId: string = '9251752';
    switch (getBreakpointKey()) {
        case 'D':
            if (containsMpuOrDmpu(sizes)) {
                return '9251752';
            }
            if (containsLeaderboardOrBillboard(sizes)) {
                return '9926678';
            }
            return defaultPlacementId;
        case 'M':
            if (containsMpu(sizes)) {
                return '4298191';
            }
            return defaultPlacementId;
        case 'T':
            if (containsMpu(sizes)) {
                return '11600568';
            }
            if (containsLeaderboard(sizes)) {
                return '11600778';
            }
            return defaultPlacementId;
        default:
            return defaultPlacementId;
    }
};

export const getAppNexusDirectBidParams = (
    sizes: PrebidSize[],
    isAuRegion: boolean
): PrebidAppNexusParams => {
    if (isAuRegion && config.get('switches.prebidAppnexusInvcode')) {
        const invCode = getAppNexusInvCode(sizes);
        // flowlint sketchy-null-string:warn
        if (invCode) {
            return {
                invCode,
                member: '7012',
                keywords: {
                    invc: [invCode],
                    ...buildAppNexusTargetingObject(buildPageTargeting()),
                },
            };
        }
    }
    return {
        placementId: getAppNexusDirectPlacementId(sizes, isAuRegion),
        keywords: buildAppNexusTargetingObject(buildPageTargeting()),
    };
};

export const getAppNexusServerSideBidParams = (
    sizes: PrebidSize[]
): PrebidAppNexusParams =>
    Object.assign(
        {},
        {
            placementId: getAppNexusPlacementId(sizes),
            keywords: buildAppNexusTargetingObject(buildPageTargeting()), // Ok to duplicate call. Lodash 'once' is used.
        },
        window.OzoneLotameData ? { lotame: window.OzoneLotameData } : {}
    );

export const _ = {
    getAppNexusPlacementId,
    getAppNexusInvCode,
    getAppNexusDirectPlacementId,
};
