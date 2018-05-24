// @flow

import 'prebid.js/build/dist/prebid';
import config from 'lib/config';
import { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { bidders } from 'commercial/modules/prebid/bidder-config';
import { labels } from 'commercial/modules/prebid/labels';
import { slots } from 'commercial/modules/prebid/slot-config';
import { priceGranularity } from 'commercial/modules/prebid/price-config';
import type {
    PrebidBid,
    PrebidBidder,
    PrebidMediaTypes,
    PrebidSlot,
    PrebidSlotLabel,
} from 'commercial/modules/prebid/types';
import {
    getRandomIntInclusive,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from 'commercial/modules/prebid/utils';

const bidderTimeout = 1500;

const consentManagement = {
    cmpApi: 'iab',
    timeout: 8000,
    allowAuctionWithoutConsent: true,
};

class PrebidAdUnit {
    code: ?string;
    bids: ?(PrebidBid[]);
    mediaTypes: ?PrebidMediaTypes;
    labelAny: ?(PrebidSlotLabel[]);
    labelAll: ?(PrebidSlotLabel[]);

    constructor(advert: Advert, slot: PrebidSlot) {
        this.code = advert.id;
        this.bids = bidders.map((bidder: PrebidBidder) => {
            const bid: PrebidBid = {
                bidder: bidder.name,
                params: bidder.bidParams(advert.id, slot.sizes),
            };
            if (bidder.labelAny) {
                bid.labelAny = bidder.labelAny;
            }
            if (bidder.labelAll) {
                bid.labelAll = bidder.labelAll;
            }
            return bid;
        });
        this.mediaTypes = { banner: { sizes: slot.sizes } };
        if (slot.labelAny) {
            this.labelAny = slot.labelAny;
        }
        if (slot.labelAll) {
            this.labelAll = slot.labelAll;
        }
    }

    isEmpty() {
        return this.code == null;
    }
}

class PrebidService {
    static initialise(): void {

        if(config.switches.enableConsentManagementService) {
            window.pbjs.setConfig({
                bidderTimeout,
                priceGranularity,
                consentManagement,
            });
        } else {
            window.pbjs.setConfig({
                bidderTimeout,
                priceGranularity,
            });
        }

        // gather analytics from 0.01% of pageviews
        const inSample = getRandomIntInclusive(1, 10000) === 1;
        if (
            config.switches.prebidAnalytics &&
            (inSample || config.page.isDev)
        ) {
            window.pbjs.enableAnalytics([
                {
                    provider: 'gu',
                    options: {
                        ajaxUrl: config.page.ajaxUrl,
                        pv: config.ophan.pageViewId,
                    },
                },
            ]);
        }

        window.pbjs.bidderSettings = {};

        if (config.switches.prebidSonobi) {
            window.pbjs.bidderSettings.sonobi = {
                // for Jetstream deals
                alwaysUseBid: true,
            };
        }

        if (config.switches.prebidXaxis) {
            window.pbjs.bidderSettings.xhb = {
                // for First Look deals
                alwaysUseBid: true,
                adserverTargeting: [
                    {
                        key: 'hb_buyer_id',
                        val(bidResponse) {
                            return bidResponse.buyerMemberId;
                        },
                    },
                ],
            };
        }
    }

    static requestQueue: Promise<void> = Promise.resolve();

    static requestBids(advert: Advert): Promise<void> {
        if (dfpEnv.externalDemand !== 'prebid') {
            return PrebidService.requestQueue;
        }

        const adUnits = slots
            .filter(slot =>
                stripTrailingNumbersAbove1(
                    stripMobileSuffix(advert.id)
                ).endsWith(slot.key)
            )
            .map(slot => new PrebidAdUnit(advert, slot))
            .filter(adUnit => !adUnit.isEmpty());

        if (adUnits.length === 0) {
            return PrebidService.requestQueue;
        }

        PrebidService.requestQueue = PrebidService.requestQueue
            .then(
                () =>
                    new Promise(resolve => {
                        window.pbjs.que.push(() => {
                            window.pbjs.requestBids({
                                adUnits,
                                bidsBackHandler() {
                                    window.pbjs.setTargetingForGPTAsync([
                                        adUnits[0].code,
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
