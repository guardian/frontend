import {
    buildAppNexusTargetingObject,
    getPageTargeting,
} from 'common/modules/commercial/build-page-targeting';
import { isInAuOrNz, isInUsOrCa } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';
import type { HeaderBiddingSize, PrebidAppNexusParams } from '../types';
import {
    containsLeaderboard,
    containsLeaderboardOrBillboard,
    containsMpu,
    containsMpuOrDmpu,
    getBreakpointKey,
    getLargestSize,
} from '../utils';

const getAppNexusInvCode = (
    sizes: HeaderBiddingSize[]
): string | null | undefined => {
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
    const defaultPlacementId = '13915593';
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

    const defaultPlacementId = '9251752';
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

// TODO are we using getAppNexusServerSideBidParams anywhere?
export const getAppNexusServerSideBidParams = (
    sizes: HeaderBiddingSize[]
): PrebidAppNexusParams => ({
    placementId: getAppNexusPlacementId(sizes),
    keywords: buildAppNexusTargetingObject(getPageTargeting()), // Ok to duplicate call. Lodash 'once' is used.

    ...(window.OzoneLotameData ? { lotame: window.OzoneLotameData } : {}),
});

export const _ = {
    getAppNexusPlacementId,
    getAppNexusInvCode,
    getAppNexusDirectPlacementId,
};
