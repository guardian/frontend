import config from '../../../../../lib/config';
import { dfpEnv } from '../../dfp/dfp-env';
import { bids } from './bid-config';
import { getHeaderBiddingAdSlots } from '../slot-config';
import { priceGranularity } from './price-config';
import { getAdvertById } from '../../dfp/get-advert-by-id';
import { stripDfpAdPrefixFrom } from '../utils';
import { EventTimer } from '@guardian/commercial-core';
import { pubmatic } from './pubmatic';
import { log } from '@guardian/libs';

const bidderTimeout = 1500;


class PrebidAdUnit {
    constructor(advert, slot) {
        this.code = advert.id;
        this.bids = bids(advert.id, slot.sizes);
        this.mediaTypes = { banner: { sizes: slot.sizes } };
        log('commercial', 'PrebidAdUnit', this );
    }

    isEmpty() {
        return this.code == null;
    }
}

let requestQueue = Promise.resolve();
let initialised = false;

const initialise = (window, framework = 'tcfv2') => {
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

	const consentManagement = () => {
		switch (framework) {
			case 'aus':
			case 'ccpa':
				// https://docs.prebid.org/dev-docs/modules/consentManagementUsp.html
				return {
					usp: {
						cmpApi: 'iab',
						timeout: 1500,
					},
				};
			case 'tcfv2':
			default:
				// https://docs.prebid.org/dev-docs/modules/consentManagement.html
				return {
					gdpr: {
						cmpApi: 'iab',
						timeout: 200,
						defaultGdprScope: true,
					},
				};
		}
	};

    const pbjsConfig = Object.assign(
        {},
        {
            bidderTimeout,
            priceGranularity,
            userSync,
        },
    );

    if(config.get('switches.consentManagement', false)) {
        pbjsConfig.consentManagement = consentManagement()
    }

    if (
		config.get('switches.permutive', false) &&
		config.get('switches.prebidPermutiveAudience', false)
	) {
		pbjsConfig.realTimeData = {
			dataProviders: [
				{
					name: 'permutive',
					params: {
						acBidders: ['appnexus', 'ozone', 'pubmatic', 'trustx'],
						overwrites: {
							pubmatic,
						},
					},
				},
			],
		};
	}

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
            bidCpmAdjustment : (bidCpm) => {
                return bidCpm * 1.05;
            }
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

    const eventTimer = EventTimer.get();

    requestQueue = requestQueue
        .then(
            () =>
                new Promise(resolve => {
                    window.pbjs.que.push(() => {
                        adUnits.map(adUnit => eventTimer.trigger('prebidStart', stripDfpAdPrefixFrom(adUnit.code)));

                        window.pbjs.requestBids({
                            adUnits,
                            bidsBackHandler() {
                                window.pbjs.setTargetingForGPTAsync([
                                    adUnits[0].code,
                                ]);
                                adUnits.map(adUnit => eventTimer.trigger('prebidEnd', stripDfpAdPrefixFrom(adUnit.code)));
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
