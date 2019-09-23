// @flow strict

import config from 'lib/config';
import { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { bids } from 'commercial/modules/prebid/bid-config';
import { slots } from 'commercial/modules/prebid/slot-config';
import { priceGranularity } from 'commercial/modules/prebid/price-config';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import type {
    PrebidBid,
    PrebidMediaTypes,
    PrebidSlot,
} from 'commercial/modules/prebid/types';
import type { PrebidPriceGranularity } from 'commercial/modules/prebid/price-config';

type EnableAnalyticsConfig = {
    provider: string,
    options: {
        ajaxUrl: string,
        pv: string,
    },
};

type ConsentManagement = {
    cmpApi: string,
    timeout: number,
    allowAuctionWithoutConsent: boolean,
};

type S2SConfig = {
    accountId: string,
    enabled: boolean,
    bidders: Array<string>,
    timeout: number,
    adapter: string,
    is_debug: 'true' | 'false',
    endpoint: string,
    syncEndpoint: string,
    cookieSet: boolean,
    cookiesetUrl: string,
};

type UserSync =
    | {
          syncsPerBidder: number,
          filterSettings: {
              all: {
                  bidders: string,
                  filter: string,
              },
          },
      }
    | { syncEnabled: false };

type PbjsConfig = {
    bidderTimeout: number,
    priceGranularity: PrebidPriceGranularity,
    userSync: UserSync,
    consentManagement: ConsentManagement | false,
    s2sConfig: S2SConfig,
};

type XasisBuyerTargetting = {
    key: string,
    val: ({
        appnexus: {
            buyerMemberId: string,
        },
    }) => string,
};

type XasisHeaderBidderConfig = {
    adserverTargeting: Array<XasisBuyerTargetting>,
};

type BidderSettings = {
    xhb: XasisHeaderBidderConfig,
};

type PbjsEvent = 'bidWon';

type PbjsEventData = {
    width: number,
    height: number,
    adUnitCode: string,
};

type PbjsEventHandler = PbjsEventData => void;

const bidderTimeout: number = 1500;

const consentManagement: ConsentManagement = {
    cmpApi: 'iab',
    timeout: 200,
    allowAuctionWithoutConsent: true,
};

const s2sConfig: S2SConfig = {
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

let requestQueue: Promise<void> = Promise.resolve();
let initialised: boolean = false;

const initialise = (window: {
    pbjs: {
        setConfig: PbjsConfig => void,
        bidderSettings: BidderSettings,
        enableAnalytics: ([EnableAnalyticsConfig]) => void,
        onEvent: (PbjsEvent, PbjsEventHandler) => void,
    },
}): void => {
    initialised = true;

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

    const pbjsConfig: PbjsConfig = Object.assign(
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
                    val(bidResponse): string {
                        // flowlint sketchy-null-mixed:warn
                        return bidResponse.appnexus
                            ? bidResponse.appnexus.buyerMemberId
                            : '';
                    },
                },
            ],
        };
    }

    // Adjust slot size when prebid ad loads
    window.pbjs.onEvent('bidWon', data => {
        const { width, height, adUnitCode } = data;

        if (!width || !height || !adUnitCode) {
            return;
        }

        const size = [width, height]; // eg. [300, 250]
        const advert: ?Advert = getAdvertById(adUnitCode);

        if (!advert) {
            return;
        }

        advert.size = size;
        /**
         * when hasPrebidSize is true we use size
         * set here when adjusting the slot size.
         * */
        advert.hasPrebidSize = true;
    });
};

// slotFlatMap allows you to dynamically interfere with the PrebidSlot definition
// for this given request for bids.
const requestBids = (
    advert: Advert,
    slotFlatMap?: PrebidSlot => PrebidSlot[]
): Promise<void> => {
    if (!initialised) {
        return requestQueue;
    }

    const effectiveSlotFlatMap = slotFlatMap || (s => [s]); // default to identity
    if (dfpEnv.externalDemand !== 'prebid') {
        return requestQueue;
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
        return requestQueue;
    }

    requestQueue = requestQueue
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

    return requestQueue;
};

export default {
    initialise,
    requestBids,
};
