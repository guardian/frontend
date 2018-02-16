// @flow

import 'prebid.js/build/dist/prebid';
import { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { bidders } from 'commercial/modules/prebid/bidder-config';
import { labels } from 'commercial/modules/prebid/labels';
import { slots } from 'commercial/modules/prebid/slot-config';
import type {
    PrebidBid,
    PrebidBidder,
    PrebidSize,
    PrebidSlot,
    PrebidSlotLabel,
} from 'commercial/modules/prebid/types';
import { stripTrailingNumbers } from 'commercial/modules/prebid/utils';

const bidderTimeout = 1500;

class PrebidAdUnit {
    code: string;
    sizes: PrebidSize[];
    bids: PrebidBid[];
    labelAny: PrebidSlotLabel[];
    labelAll: PrebidSlotLabel[];

    constructor(advert: Advert) {
        const slot: ?PrebidSlot = slots.find((s): boolean =>
            stripTrailingNumbers(advert.id).endsWith(s.key)
        );

        if (slot) {
            this.code = advert.id;
            this.sizes = slot.sizes;
            this.labelAny = slot.labelAny ? slot.labelAny : [];
            this.labelAll = slot.labelAll ? slot.labelAll : [];
            this.bids = bidders.map((bidder: PrebidBidder) => ({
                bidder: bidder.name,
                params: bidder.bidParams(this.code, this.sizes),
                labelAny: bidder.labelAny,
                labelAll: bidder.labelAll,
            }));
        } else {
            this.code = '';
            this.sizes = [];
            this.bids = [];
            this.labelAny = [];
            this.labelAll = [];
        }
    }
}

class PrebidService {
    static initialise(): void {
        window.pbjs.bidderSettings = {
            standard: {
                alwaysUseBid: false,
            },
            sonobi: {
                // for Jetstream
                alwaysUseBid: true,
                adserverTargeting: [
                    {
                        key: 'hb_deal_sonobi',
                        val(bidResponse) {
                            return bidResponse.dealId;
                        },
                    },
                ],
            },
        };
        window.pbjs.setConfig({
            priceGranularity: 'auto',
        });
    }

    // Prebid 1.0 supports concurrent bid requests, but for 0.34, each request
    // must be enqueued sequentially.
    static requestQueue: Promise<void> = Promise.resolve();

    static requestBids(advert: Advert): Promise<void> {
        if (dfpEnv.externalDemand !== 'prebid') {
            return PrebidService.requestQueue;
        }
        const adUnit = new PrebidAdUnit(advert);

        if (adUnit.sizes.length === 0) {
            return PrebidService.requestQueue;
        }

        PrebidService.requestQueue = PrebidService.requestQueue
            .then(
                () =>
                    new Promise(resolve => {
                        window.pbjs.que.push(() => {
                            window.pbjs.requestBids({
                                adUnits: [adUnit],
                                timeout: bidderTimeout,
                                bidsBackHandler() {
                                    window.pbjs.setTargetingForGPTAsync([
                                        adUnit.code,
                                    ]);
                                    resolve();
                                },
                                labels,
                            });
                        });
                    })
            )
            .catch(() => {});

        return PrebidService.requestQueue;
    }
}

export const prebid = PrebidService;
