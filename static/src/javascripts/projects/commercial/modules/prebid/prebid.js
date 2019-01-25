// @flow strict

import config from 'lib/config';
import { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { bids } from 'commercial/modules/prebid/bid-config';
import { slots } from 'commercial/modules/prebid/slot-config';
import { priceGranularity } from 'commercial/modules/prebid/price-config';
import type {
    PrebidBid,
    PrebidMediaTypes,
    PrebidSlot,
} from 'commercial/modules/prebid/types';

const bidderTimeout = 1500;

const consentManagement = {
    cmpApi: 'iab',
    timeout: 200,
    allowAuctionWithoutConsent: true,
};

const s2sConfig = {
    accountId: '1',
    enabled: true,
    bidders: ['appnexus', 'openx', 'pangaea'],
    timeout: bidderTimeout,
    adapter: 'prebidServer',
    is_debug: 'false',
    endpoint: 'https://elb.the-ozone-project.com/openrtb2/auction',
    syncEndpoint: 'https://elb.the-ozone-project.com/cookie_sync',
    cookieSet: true,
    cookiesetUrl: 'https://acdn.adnxs.com/cookieset/cs.js',
};

class PrebidAdUnit {
    code: ?string;
    bids: ?(PrebidBid[]);
    mediaTypes: ?PrebidMediaTypes;

    constructor(advert: Advert, slot: PrebidSlot) {
        this.code = advert.id;
        this.bids = bids(advert.id, slot.sizes);
        this.mediaTypes = { banner: { sizes: slot.sizes } };
    }

    isEmpty() {
        return this.code == null;
    }
}

class PrebidService {
    static initialise(): void {
        const userSync = config.get('switches.prebidUserSync', false)
            ? {
                  // syncsPerBidder: 0, // allow all syncs - bug https://github.com/prebid/Prebid.js/issues/2781
                  syncsPerBidder: 999, // temporarily until above bug fixed
                  filterSettings: {
                      all: {
                          bidders: '*', // allow all bidders to sync by iframe or image beacons
                          filter: 'include',
                      },
                  },
              }
            : { syncEnabled: false };

        const pbjsConfig = Object.assign(
            {},
            {
                bidderTimeout,
                priceGranularity,
                userSync,
            },
            config.get('switches.enableConsentManagementService', false)
                ? { consentManagement }
                : {},
            config.get('switches.prebidS2sozone', false) ? { s2sConfig } : {}
        );

        window.pbjs.setConfig(pbjsConfig);

        if (config.get('switches.prebidAnalytics', false)) {
            window.pbjs.enableAnalytics([
                {
                    provider: 'gu',
                    options: {
                        ajaxUrl: config.get('page.ajaxUrl'),
                        pv: config.get('ophan.pageViewId'),
                    },
                },
            ]);
        }

        // This creates an 'unsealed' object. Flows
        // allows dynamic assignment.
        window.pbjs.bidderSettings = {};

        if (config.get('switches.prebidXaxis', false)) {
            window.pbjs.bidderSettings.xhb = {
                adserverTargeting: [
                    {
                        key: 'hb_buyer_id',
                        val(bidResponse) {
                            return bidResponse.appnexus
                                ? bidResponse.appnexus.buyerMemberId
                                : '';
                        },
                    },
                ],
            };
        }
    }

    static requestQueue: Promise<void> = Promise.resolve();

    // slotFlatMap allows you to dynamically interfere with the PrebidSlot definition
    // for this given request for bids.
    static requestBids(
        advert: Advert,
        slotFlatMap?: PrebidSlot => PrebidSlot[]
    ): Promise<void> {
        const effectiveSlotFlatMap = slotFlatMap || (s => [s]); // default to identity
        if (dfpEnv.externalDemand !== 'prebid') {
            return PrebidService.requestQueue;
        }

        const adUnits: Array<PrebidAdUnit> = slots(
            advert.id,
            config.get('page.contentType', '')
        )
            .map(effectiveSlotFlatMap)
            .reduce((acc, elt) => acc.concat(elt), []) // the "flat" in "flatMap"
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
                            });
                        });
                    })
            )
            .catch(() => {});

        return PrebidService.requestQueue;
    }
}

export const prebid = PrebidService;
