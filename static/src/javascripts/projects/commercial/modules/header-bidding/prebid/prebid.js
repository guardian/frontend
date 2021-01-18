

import config from 'lib/config';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { bids } from 'commercial/modules/header-bidding/prebid/bid-config';
import { getHeaderBiddingAdSlots } from 'commercial/modules/header-bidding/slot-config';
import { priceGranularity } from 'commercial/modules/header-bidding/prebid/price-config';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';













const bidderTimeout = 1500;

const consentManagement = {
    gdpr: {
        cmpApi: 'iab',
        timeout: 200,
        allowAuctionWithoutConsent: true,
    },
    usp: {
        timeout: 1500,
    },
};

class PrebidAdUnit {
    code;
    bids;
    mediaTypes;

    constructor(advert, slot) {
        this.code = advert.id;
        this.bids = bids(advert.id, slot.sizes);
        this.mediaTypes = { banner: { sizes: slot.sizes } };
    }

    isEmpty() {
        return this.code == null;
    }
}

let requestQueue = Promise.resolve();
let initialised = false;

const initialise = (window) => {
    initialised = true;

    const userSync = config.get('switches.prebidUserSync', false)
        ? {
              syncsPerBidder: 0, // allow all syncs
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
        config.get('switches.consentManagement', false)
            ? { consentManagement }
            : {}
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
        const advert = getAdvertById(adUnitCode);

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
    advert,
    slotFlatMap
) => {
    if (!initialised) {
        return requestQueue;
    }

    if (!dfpEnv.hbImpl.prebid) {
        return requestQueue;
    }

    const adUnits = getHeaderBiddingAdSlots(
        advert,
        slotFlatMap
    )
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
