// @flow strict
import {
    getBreakpointKey,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
    shouldIncludeMobileSticky,
} from 'commercial/modules/prebid/utils';

import config from 'lib/config';

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

const getSlots = (contentType: string): Array<PrebidSlot> => {
    const isArticle = contentType === 'Article';
    const isCrossword = contentType === 'Crossword';
    const hasShowcase = config.get('page.hasShowcaseMainElement', false);
    const hasExtendedMostPop =
        isArticle && config.get('switches.extendedMostPopular');

    const commonSlots: Array<PrebidSlot> = [
        {
            key: 'right',
            sizes: hasShowcase ? [[300, 250]] : [[300, 600], [300, 250]],
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
            sizes: isArticle
                ? [[160, 600], [300, 600], [300, 250]]
                : [[300, 250]],
        },
        {
            key: 'mostpop',
            sizes: hasExtendedMostPop ? [[300, 600], [300, 250]] : [[300, 250]],
        },
        {
            key: 'comments',
            sizes: [[160, 600], [300, 250], [300, 600]],
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
        {
            key: 'mostpop',
            sizes: hasExtendedMostPop
                ? [[300, 600], [300, 250], [728, 90]]
                : [[300, 250]],
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
        {
            key: 'mostpop',
            sizes: [[300, 250]],
        },
    ];

    const mobileStickySlot: PrebidSlot = {
        key: 'mobile-sticky',
        sizes: [[320, 50]],
    };

    switch (getBreakpointKey()) {
        case 'M':
            return shouldIncludeMobileSticky() &&
                config.get('switches.mobileStickyPrebid')
                ? commonSlots.concat([...mobileSlots, mobileStickySlot])
                : commonSlots.concat(mobileSlots);
        case 'T':
            return commonSlots.concat(tabletSlots);
        default:
            return commonSlots.concat(desktopSlots);
    }
};

export const slots = (advertId: string, contentType: string) =>
    filterByAdvertId(advertId, getSlots(contentType));

export const _ = { getSlots };
