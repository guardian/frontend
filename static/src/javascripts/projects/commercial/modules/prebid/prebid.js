// @flow strict

import 'prebid.js/build/dist/prebid';
import config from 'lib/config';
import { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { bids } from 'commercial/modules/prebid/bid-config';
import { labels } from 'commercial/modules/prebid/labels';
import { slots } from 'commercial/modules/prebid/slot-config';
import { priceGranularity } from 'commercial/modules/prebid/price-config';
import type {
    PrebidBid,
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
    timeout: 200,
    allowAuctionWithoutConsent: true,
};

const userSync = {
    // syncsPerBidder: 0, // allow all syncs - bug https://github.com/prebid/Prebid.js/issues/2781
    syncsPerBidder: 999, // temporarily until above bug fixed
    filterSettings: {
        all: {
            bidders: '*', // allow all bidders to sync by iframe or image beacons
            filter: 'include',
        },
    },
};

const s2sConfig = {
    accountId: '1',
    enabled: true,
    bidders: [
        'appnexus',
        'openx', // Defined in the doc.
    ],
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
    labelAny: ?(PrebidSlotLabel[]);
    labelAll: ?(PrebidSlotLabel[]);

    constructor(advert: Advert, slot: PrebidSlot) {
        this.code = advert.id;
        this.bids = bids(advert.id, slot.sizes);
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

        // gather analytics from 20% (1 in 5) of page views
        const inSample = getRandomIntInclusive(1, 5) === 1;
        if (
            config.get('switches.prebidAnalytics', false) &&
            (inSample || config.get('page.isDev', false))
        ) {
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

        const adUnits: Array<PrebidAdUnit> = slots
            .filter(slot =>
                stripTrailingNumbersAbove1(
                    stripMobileSuffix(advert.id)
                ).endsWith(slot.key)
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
                            // Capture this specific auction starting
                            // to set this slot pbaid targeting value
                            const auctionInitHandler = (data: {
                                auctionId: string,
                            }) => {
                                // Get rid of this handler now.
                                window.pbjs.offEvent(
                                    'auctionInit',
                                    auctionInitHandler
                                );
                                advert.slot.setTargeting(
                                    'hb_auction',
                                    data.auctionId
                                );
                            };
                            window.pbjs.onEvent(
                                'auctionInit',
                                auctionInitHandler
                            );

                            const onAuctionEndHandler = () => {
                                const getHighestCpm = (auctionBids): number =>
                                    (auctionBids &&
                                        auctionBids
                                            .map(_ => _.cpm)
                                            .sort()
                                            .pop()) ||
                                    0;
                                const bidResponses = window.pbjs.getBidResponses()[
                                    advert.id
                                ];

                                const cpm: number = getHighestCpm(
                                    (bidResponses && bidResponses.bids) || []
                                );
                                if (cpm > 0) {
                                    advert.slot.setTargeting('hb_cpm', cpm);
                                }
                                window.pbjs.offEvent(
                                    'auctionEnd',
                                    onAuctionEndHandler
                                );
                            };

                            window.pbjs.onEvent(
                                'auctionEnd',
                                onAuctionEndHandler
                            );

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
