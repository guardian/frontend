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
import 'prebid.js/build/dist/prebid';

const bidders = [sonobiBidder, indexExchangeBidder];

const isEqualAdSize = (a: PrebidSize, b: PrebidSize): boolean =>
    a[0] === b[0] && a[1] === b[1];

const filterConfigEntries = (
    bidder: string,
    slotSizes: PrebidSize[]
): PrebidAdSlotCriteria[] => {
    let bidConfigEntries: PrebidAdSlotCriteria[] = bidderConfig[bidder] || [];

    bidConfigEntries = bidConfigEntries.filter(
        bid => bid.edition === config.page.edition
    );
    bidConfigEntries = bidConfigEntries.filter(bid =>
        isBreakpoint(bid.breakpoint)
    );
    bidConfigEntries = bidConfigEntries.filter(bid =>
        slotSizes.find(size => isEqualAdSize(size, bid.size))
    );

    return bidConfigEntries;
};

const getMatchingBids = (
    availableSizes: PrebidSize[],
    matchedSizes: PrebidSize[],
    slotId: string
): PrebidBid[] => {
    const bids: PrebidBid[] = [];
    bidders.forEach((bidder: PrebidBidder) => {
        const matchingConfigEntries: PrebidAdSlotCriteria[] = filterConfigEntries(
            bidder.name,
            availableSizes
        );
        if (matchingConfigEntries.length > 0) {
            // A config entry will specify a size, which should be added to the prebid ad unit if's not already included.
            matchingConfigEntries.forEach(
                (matchedEntry: PrebidAdSlotCriteria) => {
                    if (
                        matchedSizes.findIndex(size =>
                            isEqualAdSize(size, matchedEntry.size)
                        ) === -1
                    ) {
                        matchedSizes.push(matchedEntry.size);
                    }
                }
            );

            bids.push({
                bidder: bidder.name,
                params: bidder.bidParams(slotId),
            });
        }
    });
    return bids;
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

        // Each Advert can take a number of possible of sizes. Using this array of sizes,
        // find an entry in the bidder-config.js config object that matches the criteria.
        const advertSizes: PrebidSize[] = getAdSizesFromAdvert(advert);
        this.bids = getMatchingBids(advertSizes, this.sizes, this.code);
    }
}

class PrebidTestService {
    static initialise(): Promise<any> {
        window.pbjs.bidderSettings = {
            standard: {
                alwaysUseBid: false,
            },
        };
        return Promise.resolve();
    }

    static slotIsInTest(advert: Advert): boolean {
        return ['dfp-ad--inline1', 'dfp-ad--inline2'].indexOf(advert.id) !== -1;
    }

    static requestBids(advert: Advert): Promise<void> {
        if (
            !PrebidTestService.slotIsInTest(advert) ||
            dfpEnv.externalDemand !== 'prebid'
        ) {
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
                    bidsBackHandler() {
                        window.pbjs.setTargetingForGPTAsync();
                        resolve();
                    },
                });
            });
        });
    }
}

export const prebid = PrebidTestService;
