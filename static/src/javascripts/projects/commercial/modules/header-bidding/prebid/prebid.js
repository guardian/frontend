import config from '../../../../../lib/config';
import { dfpEnv } from '../../dfp/dfp-env';
import { bids } from './bid-config';
import { getHeaderBiddingAdSlots } from '../slot-config';
import { priceGranularity } from './price-config';
import { getAdvertById } from '../../dfp/get-advert-by-id';
import { markTime } from '../../../../../lib/user-timing';
import { stripDfpAdPrefixFrom } from '../utils';

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

const recordFirstPrebidStarted = once(() => {
    markTime('First Prebid Ad Request Started');
});

const recordFirstPrebidEnded = once(() => {
    markTime('First Prebid Ad Request Ended');
});


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
                        // TODO: Replace with commercial core's API
                        recordFirstPrebidStarted();
                        const adUnitsCodes = adUnits.map(adUnit => stripDfpAdPrefixFrom(adUnit.code));
                        if (adUnitsCodes.indexOf('top-above-nav') !== -1) {
                            markTime(`Prebid Started for Top Above Nav (${adUnitsCodes})`);
                        }


                        window.pbjs.requestBids({
                            adUnits,
                            bidsBackHandler() {
                                window.pbjs.setTargetingForGPTAsync([
                                    adUnits[0].code,
                                ]);
                                // TODO: Replace with commercial core's API
                                recordFirstPrebidStarted();
                                if (adUnitsCodes.indexOf('top-above-nav') !== -1) {
                                    markTime(`Prebid Ended for Top Above Nav (${adUnitsCodes})`);
                                }
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
