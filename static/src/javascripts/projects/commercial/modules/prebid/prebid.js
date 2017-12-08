// @flow

import config from 'lib/config';
import { isBreakpoint, breakpoints, type Breakpoint } from 'lib/detect';
import { loadScript } from 'lib/load-script';
import { bidderConfig } from 'commercial/modules/prebid/bidder-config';
import { Advert } from 'commercial/modules/dfp/Advert';
import { breakpointNameToAttribute } from 'commercial/modules/dfp/breakpoint-name-to-attribute';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';

class PrebidTestService {

    static bidders = ['sonobi'];

    initialise(): Promise<any> {
        const loadPrebid = loadScript('//acdn.adnxs.com/prebid/not-for-prod/prebid.js', { async: false });

        return loadPrebid.then(() => {
            window.pbjs.bidderSettings = {
                standard: {
                    alwaysUseBid: false
                }
            }
        });
    };

    slotIsInTest(advert: Advert): boolean {
        return ['dfp-ad--inline1', 'dfp-ad--inline2'].indexOf(advert.id) !== -1;
    };

    requestBids(advert: Advert): Promise<void> {
        if (!this.slotIsInTest(advert) || dfpEnv.externalDemand !== 'prebid'){
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
                    bidsBackHandler(bidResponses) {
                        window.pbjs.setTargetingForGPTAsync();
                        resolve();
                    }
                });
            });
        });
    };
}

class PrebidAdUnit {

    code: string;
    sizes: PrebidSize[];
    bids: PrebidBid[];

    constructor(advert: Advert) {
        this.code = advert.id;
        this.sizes = getSlotAdSizes(advert);
        this.bids = getBids(this.sizes, this.code);
    }
}

type PrebidBid = {
    bidder: string,
    params: PrebidSonobiParams
};

type PrebidSonobiParams = {
    ad_unit: string,
    dom_id: ?string,
    floor: ?number
}

type PrebidSize = [number, number];

function hasMatchingConfig(bidder: string, slotSizes: PrebidSize[]) {
    let bidConfigEntries = bidderConfig[bidder] || [];
    
    bidConfigEntries = bidConfigEntries.filter(bid => bid.edition === config.page.edition);
    bidConfigEntries = bidConfigEntries.filter(bid => isBreakpoint(bid.breakpoint));
    bidConfigEntries = bidConfigEntries.filter(bid => {
        return slotSizes.find(([width, height]) => width === bid.width && height === bid.height);
    });

    return bidConfigEntries.length > 0;
}

function getBids(slotSizes: PrebidSize[], slotId: string): PrebidBid[] {
    let bids: PrebidBid[] = [];
    PrebidTestService.bidders.forEach( bidder => {
        if (hasMatchingConfig(bidder, slotSizes)) {
            bids.push({
                bidder,
                params : {
                    ad_unit: config.page.adUnit,
                    dom_id: slotId,
                    floor: 0.5
                }
            });
        }
    });
    return bids;
}

// Returns array of dimensions, eg. [[300, 250], [300, 600]]
function getSlotAdSizes(advert: Advert) : PrebidSize[] {

    const validBreakpoints: Breakpoint[] = breakpoints.filter( breakpoint => isBreakpoint({min : breakpoint.name}) );
    const validBreakpointKeys: string[] = validBreakpoints.map( breakpoint => breakpointNameToAttribute(breakpoint.name)).reverse();
    const bestMatch: string = validBreakpointKeys.find(breakpointName => breakpointName in advert.sizes) || '';
    
    const sizes: any[] = advert.sizes[bestMatch] || [];
    const validSizes = sizes.filter( ([width, height]) => Number.isInteger(width) && Number.isInteger(height));
    return (validSizes: PrebidSize[]);
}

export const prebid = new PrebidTestService();
