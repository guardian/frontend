// @flow

import config from 'lib/config';
import { isBreakpoint, breakpoints, type Breakpoint } from 'lib/detect';
import {
    bidderConfig,
    sonobiBidder,
    indexExchangeBidder,
} from 'commercial/modules/prebid/bidder-config';
import type {
    PrebidBidder,
    PrebidAdSlotCriteria,
    PrebidSize,
    PrebidBid,
} from 'commercial/modules/prebid/types';
import { Advert } from 'commercial/modules/dfp/Advert';
import { breakpointNameToAttribute } from 'commercial/modules/dfp/breakpoint-name-to-attribute';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';

const bidders = [sonobiBidder, indexExchangeBidder];
const bidderTimeout = 1500;

const isEqualAdSize = (a: PrebidSize, b: PrebidSize): boolean =>
    a[0] === b[0] && a[1] === b[1];

const filterConfigEntries = (
    bidder: string,
    slotSizes: PrebidSize[],
    slotId: string
): PrebidAdSlotCriteria[] => {
    let bidConfigEntries: PrebidAdSlotCriteria[] = bidderConfig[bidder] || [];

    bidConfigEntries = bidConfigEntries.filter(bid =>
        bid.slots.some(slotName => slotId.startsWith(slotName))
    );
    bidConfigEntries = bidConfigEntries.filter(
        bid => bid.edition === config.page.edition || bid.edition === 'any'
    );
    bidConfigEntries = bidConfigEntries.filter(bid =>
        isBreakpoint(bid.breakpoint)
    );
    bidConfigEntries = bidConfigEntries.filter(bid =>
        slotSizes.some(slotSize =>
            bid.sizes.some(configSize => isEqualAdSize(configSize, slotSize))
        )
    );

    return bidConfigEntries;
};

// Returns array of dimensions, eg. [[300, 250], [300, 600]]
const getAdSizesFromAdvert = (advert: Advert): PrebidSize[] => {
    const validBreakpoints: Breakpoint[] = breakpoints.filter(breakpoint =>
        isBreakpoint({ min: breakpoint.name })
    );
    const validBreakpointKeys: string[] = validBreakpoints
        .map(breakpoint => breakpointNameToAttribute(breakpoint.name))
        .reverse();
    const bestMatch: string =
        validBreakpointKeys.find(
            breakpointName => breakpointName in advert.sizes
        ) || '';

    const sizes: any[] = advert.sizes[bestMatch] || [];
    const validSizes = sizes.filter(
        ([width, height]) => Number.isInteger(width) && Number.isInteger(height)
    );
    return (validSizes: PrebidSize[]);
};

class PrebidAdUnit {
    code: string;
    sizes: PrebidSize[];
    bids: PrebidBid[];

    constructor(advert: Advert) {
        this.code = advert.id;
        this.sizes = [];
        this.bids = [];

        // Each Advert can take a number of possible of sizes. Using this array of sizes,
        // find an entry in the bidder-config.js config object that matches the criteria.
        const advertSizes: PrebidSize[] = getAdSizesFromAdvert(advert);
        this.getMatchingBids(advertSizes);
    }

    getMatchingBids(availableSizes: PrebidSize[]) {
        bidders.forEach((bidder: PrebidBidder) => {
            const matchingConfigEntries: PrebidAdSlotCriteria[] = filterConfigEntries(
                bidder.name,
                availableSizes,
                this.code
            );
            if (matchingConfigEntries.length > 0) {
                // A config entry will specify a size, which should be added to the prebid ad unit if's not already included.
                matchingConfigEntries.forEach(
                    (matchedEntry: PrebidAdSlotCriteria) => {
                        const newSizes = matchedEntry.sizes.filter(
                            (newSize: PrebidSize) =>
                                this.sizes.findIndex(size =>
                                    isEqualAdSize(size, newSize)
                                ) === -1
                        );
                        this.sizes.push(...newSizes);
                    }
                );

                this.bids.push({
                    bidder: bidder.name,
                    params: bidder.bidParams(this.code),
                });
            }
        });
    }
}

class PrebidService {
    static initialise(): Promise<any> {
        return new Promise(resolve => {
            require.ensure(
                [],
                require => {
                    require('prebid.js/build/dist/prebid');
                    window.pbjs.bidderSettings = {
                        standard: {
                            alwaysUseBid: false,
                        },
                    };
                    resolve();
                },
                'commercial-prebid'
            );
        });
    }

    static requestBids(advert: Advert): Promise<void> {
        if (dfpEnv.externalDemand !== 'prebid') {
            return Promise.resolve();
        }
        const adUnit = new PrebidAdUnit(advert);

        if (adUnit.bids.length === 0) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            window.pbjs.que.push(() => {
                window.pbjs.addAdUnits([adUnit]);
                window.pbjs.requestBids({
                    timeout: bidderTimeout,
                    bidsBackHandler() {
                        window.pbjs.setTargetingForGPTAsync();
                        resolve();
                    },
                });
            });
        });
    }
}

export const prebid = PrebidService;
