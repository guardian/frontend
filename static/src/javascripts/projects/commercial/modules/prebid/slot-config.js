// @flow strict
import {
    getBreakpointKey,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from 'commercial/modules/prebid/utils';

import config from 'lib/config';
import memoize from 'lodash/memoize';

import type { PrebidSlot } from 'commercial/modules/prebid/types';

const filterByAdvertId = (
    advertId: string,
    slots: Array<PrebidSlot>
): Array<PrebidSlot> => {
    const adUnits = slots.filter(slot =>
        stripTrailingNumbersAbove1(stripMobileSuffix(advertId)).endsWith(
            slot.key
        )
    );
    return adUnits;
};

const getMostPopularSizes = memoize((isArticle: boolean) => {
    // Only works for articles for now.
    if (isArticle && config.get('switches.extendedMostPopular')) {
        return [[160,600], [300, 600], [300, 250]];
    }
    return [[300, 250]];
});

const getSlots = (contentType: string): Array<PrebidSlot> => {
    const isArticle = contentType === 'Article';
    const isCrossword = contentType === 'Crossword';
    const commonSlots: Array<PrebidSlot> = [
        {
            key: 'mostpop',
            sizes: getMostPopularSizes(isArticle),
        },
        {
            key: 'right',
            sizes: [[160,600], [300, 600], [300, 250]],
        },
        {
            key: 'inline1',
            sizes: isCrossword ? [[728, 90]] : [[300, 250]],
        },
    ];

    const desktopSlots: Array<PrebidSlot> = [
        {
            key: 'top-above-nav',
            sizes: [[970, 250], [728, 90]],
        },
        {
            key: 'inline',
            sizes: isArticle ? [[160,600], [300, 600], [300, 250]] : [[300, 250]],
        },
        {
            key: 'comments',
            sizes: [[160,600], [300, 250], [300, 600]],
        },
    ];

    const tabletSlots: Array<PrebidSlot> = [
        {
            key: 'top-above-nav',
            sizes: [[728, 90]],
        },
        {
            key: 'inline',
            sizes: [[300, 250]],
        },
    ];

    const mobileSlots: Array<PrebidSlot> = [
        {
            key: 'top-above-nav',
            sizes: [[300, 250]],
        },
        {
            key: 'inline',
            sizes: [[300, 250]],
        },
    ];

    switch (getBreakpointKey()) {
        case 'M':
            return commonSlots.concat(mobileSlots);
        case 'T':
            return commonSlots.concat(tabletSlots);
        default:
            return commonSlots.concat(desktopSlots);
    }
};

export const slots = (advertId: string, contentType: string) =>
    filterByAdvertId(advertId, getSlots(contentType));

export const _ = { getSlots };
