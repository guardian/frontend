// @flow strict

import config from 'lib/config';
import {
    getPageTargeting,
    buildAppNexusTargetingObject,
} from 'common/modules/commercial/build-page-targeting';

import {
    isInUsOrCa,
    isInAuOrNz } from 'common/modules/commercial/geo-utils';

import {
    getLargestSize,
    containsLeaderboard,
    containsLeaderboardOrBillboard,
    containsMpu,
    containsMpuOrDmpu,
    getBreakpointKey
} from '../utils';

import type { PrebidAppNexusParams, HeaderBiddingSize } from '../types';

const getAppNexusInvCode = (sizes: Array<HeaderBiddingSize>): ?string => {
    const device: string = getBreakpointKey() === 'M' ? 'M' : 'D';
    // section is optional and makes it through to the config object as an empty string... OTL
    const sectionName =
        config.get('page.section', '') ||
        config.get('page.sectionName', '').replace(/ /g, '-');

    const slotSize: HeaderBiddingSize | null = getLargestSize(sizes);
    if (slotSize) {
        return `${device}${sectionName.toLowerCase()}${slotSize.join('x')}`;
    }
};

export const getAppNexusPlacementId = (sizes: HeaderBiddingSize[]): string => {
    const defaultPlacementId: string = '13915593';
    if (isInUsOrCa() || isInAuOrNz()) {
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
    sizes: HeaderBiddingSize[]
): string => {
    if (isInAuOrNz()) {
        return '11016434';
    }

    if (isInUsOrCa()) {
        return '4848330';
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
                return '4371641';
            }
            if (containsLeaderboard(sizes)) {
                return '4371640';
            }
            return defaultPlacementId;
        default:
            return defaultPlacementId;
    }
};

export const getAppNexusDirectBidParams = (
    sizes: HeaderBiddingSize[]
): PrebidAppNexusParams => {
    if (isInAuOrNz() && config.get('switches.prebidAppnexusInvcode')) {
        const invCode = getAppNexusInvCode(sizes);
        // flowlint sketchy-null-string:warn
        if (invCode) {
            return {
                invCode,
                member: '7012',
                keywords: {
                    invc: [invCode],
                    ...buildAppNexusTargetingObject(getPageTargeting()),
                },
            };
        }
    }
    return {
        placementId: getAppNexusDirectPlacementId(sizes),
        keywords: buildAppNexusTargetingObject(getPageTargeting()),
    };
};

export const getAppNexusServerSideBidParams = (
    sizes: HeaderBiddingSize[]
): PrebidAppNexusParams =>
    Object.assign(
        {},
        {
            placementId: getAppNexusPlacementId(sizes),
            keywords: buildAppNexusTargetingObject(getPageTargeting()), // Ok to duplicate call. Lodash 'once' is used.
        },
        window.OzoneLotameData ? { lotame: window.OzoneLotameData } : {}
    );

export const _ = {
    getAppNexusPlacementId,
    getAppNexusInvCode,
    getAppNexusDirectPlacementId,
};
