import type { AdSize, PageTargeting } from '@guardian/commercial/core';
import { createAdSize, EventTimer, pubmatic } from '@guardian/commercial/core';
import { PREBID_TIMEOUT } from '@guardian/commercial/core/dist/esm/constants';
import { onConsent } from '@guardian/consent-management-platform';
import type { Framework } from '@guardian/consent-management-platform/dist/types';
import { isString, log } from '@guardian/libs';
import type { Advert } from 'commercial/modules/dfp/Advert';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { dfpEnv } from '../../dfp/dfp-env';
import { getAdvertById } from '../../dfp/get-advert-by-id';
import { getHeaderBiddingAdSlots } from '../slot-config';
import { stripDfpAdPrefixFrom } from '../utils';
import { bids } from './bid-config';
import type { PrebidPriceGranularity } from './price-config';
import {
	criteoPriceGranularity,
	indexPriceGranularity,
	ozonePriceGranularity,
	priceGranularity,
} from './price-config';

type CmpApi = 'iab' | 'static';
// https://docs.prebid.org/dev-docs/modules/consentManagement.html
type GDPRConfig = {
	cmpApi: CmpApi;
	timeout: number;
	defaultGdprScope: boolean;
	allowAuctionWithoutConsent?: never;
	consentData?: Record<string, unknown>;
};
// https://docs.prebid.org/dev-docs/modules/consentManagementUsp.html
type USPConfig = {
	cmpApi: CmpApi;
	timeout: number;
	consentData?: Record<string, unknown>;
};

type ConsentManagement =
	| {
			gdpr: GDPRConfig;
	  }
	| {
			usp: USPConfig;
	  };

type UserSync =
	| {
			syncsPerBidder: number;
			filterSettings: {
				all: {
					bidders: string;
					filter: string;
				};
			};
	  }
	| {
			syncEnabled: false;
	  };

type PbjsConfig = {
	bidderTimeout: number;
	timeoutBuffer?: number;
	priceGranularity: PrebidPriceGranularity;
	userSync: UserSync;
	consentManagement?: ConsentManagement;
	realTimeData?: unknown;
	criteo?: {
		fastBidVersion: 'latest' | 'none' | `${number}`;
	};
	improvedigital?: {
		usePrebidSizes?: boolean;
	};
};

type PbjsEvent = 'bidWon';
// from https://docs.prebid.org/dev-docs/publisher-api-reference/getBidResponses.html
type PbjsEventData = {
	width: number;
	height: number;
	adUnitCode: string;
	bidderCode?: BidderCode;
	statusMessage?: string;
	adId?: string;
	creative_id?: number;
	cpm?: number;
	adUrl?: string;
	requestTimestamp?: number;
	responseTimestamp?: number;
	timeToRespond?: number;
	bidder?: string;
	usesGenericKeys?: boolean;
	size?: string;
	adserverTargeting?: Record<string, unknown>;
	[x: string]: unknown;
};
type PbjsEventHandler = (data: PbjsEventData) => void;

type EnableAnalyticsConfig = {
	provider: string;
	options: {
		ajaxUrl: string;
		pv: string;
	};
};

// bidResponse expected types. Check with advertisers
type XaxisBidResponse = {
	appnexus: {
		buyerMemberId: string;
	};
	[x: string]: unknown;
};

type BuyerTargeting<T> = {
	key: string;
	val: (bidResponse: DeepPartial<T>) => string | null | undefined;
};

// https://docs.prebid.org/dev-docs/publisher-api-reference/bidderSettings.html
type BidderSetting<T = Record<string, unknown>> = {
	adserverTargeting: Array<BuyerTargeting<T>>;
	bidCpmAdjustment: (n: number) => number;
	suppressEmptyKeys: boolean;
	sendStandardTargeting: boolean;
};

type BidderSettings = {
	standard?: never; // prevent overriding the default settings
	xhb?: Partial<BidderSetting<XaxisBidResponse>>;
	improvedigital?: Partial<BidderSetting>;
	ozone?: Partial<BidderSetting>;
};

declare global {
	interface Window {
		pbjs?: {
			que: {
				push: (cb: () => void) => void;
			};
			// https://docs.prebid.org/dev-docs/publisher-api-reference/requestBids.html
			requestBids(requestObj?: {
				adUnitCodes?: string[];
				adUnits?: PrebidAdUnit[];
				timeout?: number;
				bidsBackHandler?: (
					bidResponses: unknown,
					timedOut: boolean,
					auctionId: string,
				) => void;
				labels?: string[];
				auctionId?: string;
			}): void;
			setConfig: (config: PbjsConfig) => void;
			setBidderConfig: (bidderConfig: {
				bidders: BidderCode[];
				config: {
					customPriceBucket?: PrebidPriceGranularity;
					/**
					 * This is a custom property that has been added to our fork of prebid.js
					 * to select a price bucket based on the width and height of the slot.
					 */
					guCustomPriceBucket?: (bid: {
						width: number;
						height: number;
					}) => PrebidPriceGranularity | undefined;
				};
			}) => void;
			getConfig: (item?: string) => PbjsConfig & {
				dataProviders: Array<{
					name: string;
					params: {
						acBidders: BidderCode[];
					};
				}>;
			};
			bidderSettings: BidderSettings;
			enableAnalytics: (arg0: [EnableAnalyticsConfig]) => void;
			onEvent: (event: PbjsEvent, handler: PbjsEventHandler) => void;
			setTargetingForGPTAsync: (
				codeArr?: string[],
				customSlotMatching?: (slot: unknown) => unknown,
			) => void;
		};
	}
}

/**
 * Prebid supports an additional timeout buffer to account for noisiness in
 * timing JavaScript on the page. This value is passed to the Prebid config
 * and is adjustable via this constant
 */
const timeoutBuffer = 400;

/**
 * The amount of time reserved for the auction
 */
const bidderTimeout = PREBID_TIMEOUT;

class PrebidAdUnit {
	code: string | null | undefined;
	bids: PrebidBid[] | null | undefined;
	mediaTypes: PrebidMediaTypes | null | undefined;

	constructor(
		advert: Advert,
		slot: HeaderBiddingSlot,
		pageTargeting: PageTargeting,
	) {
		this.code = advert.id;
		this.bids = bids(advert.id, slot.sizes, pageTargeting);
		this.mediaTypes = { banner: { sizes: slot.sizes } };
		advert.headerBiddingSizes = slot.sizes;
		log('commercial', `PrebidAdUnit ${this.code}`, this.bids);
	}

	isEmpty() {
		return this.code == null;
	}
}

let requestQueue: Promise<void> = Promise.resolve();
let initialised = false;

const initialise = (window: Window, framework: Framework = 'tcfv2'): void => {
	if (!window.pbjs) {
		log('commercial', 'window.pbjs not found on window');
		return; // We couldn’t initialise
	}
	initialised = true;

	const userSync: UserSync = window.guardian.config.switches.prebidUserSync
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

	const consentManagement = (): ConsentManagement => {
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

	const pbjsConfig: PbjsConfig = Object.assign(
		{},
		{
			bidderTimeout,
			timeoutBuffer,
			priceGranularity,
			userSync,
		},
	);

	window.pbjs.bidderSettings = {};

	if (window.guardian.config.switches.consentManagement) {
		pbjsConfig.consentManagement = consentManagement();
	}

	if (
		window.guardian.config.switches.permutive &&
		window.guardian.config.switches.prebidPermutiveAudience
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

	if (window.guardian.config.switches.prebidCriteo) {
		pbjsConfig.criteo = {
			fastBidVersion: 'latest',
		};

		// Use a custom price granularity for Criteo
		// Criteo has a different line item structure and so bids should be rounded to match these
		window.pbjs.setBidderConfig({
			bidders: ['criteo'],
			config: {
				customPriceBucket: criteoPriceGranularity,
			},
		});
	}

	if (window.guardian.config.switches.prebidOzone) {
		// Use a custom price granularity, which is based upon the size of the slot being auctioned
		window.pbjs.setBidderConfig({
			bidders: ['ozone'],
			config: {
				// Select the ozone granularity, use default if not defined for the size
				guCustomPriceBucket: ({ width, height }) => {
					const ozoneGranularity = ozonePriceGranularity(
						width,
						height,
					);
					log(
						'commercial',
						`Custom Prebid - Ozone price bucket for size (${width},${height}):`,
						ozoneGranularity,
					);
					return ozoneGranularity;
				},
			},
		});
	}

	if (window.guardian.config.switches.prebidIndexExchange) {
		window.pbjs.setBidderConfig({
			bidders: ['ix'],
			config: {
				guCustomPriceBucket: ({ width, height }) => {
					const indexGranularity = indexPriceGranularity(
						width,
						height,
					);
					log(
						'commercial',
						`Custom Prebid - Index price bucket for size (${width},${height}):`,
						indexGranularity,
					);

					return indexGranularity;
				},
			},
		});
	}

	if (window.guardian.config.switches.prebidAnalytics) {
		window.pbjs.enableAnalytics([
			{
				provider: 'gu',
				options: {
					ajaxUrl: window.guardian.config.page.ajaxUrl ?? '',
					pv: window.guardian.ophan.pageViewId,
				},
			},
		]);
	}

	if (window.guardian.config.switches.prebidXaxis) {
		window.pbjs.bidderSettings.xhb = {
			adserverTargeting: [
				{
					key: 'hb_buyer_id',
					val(bidResponse) {
						// TODO: should we return null or an empty string?
						return bidResponse.appnexus?.buyerMemberId ?? '';
					},
				},
			],
			bidCpmAdjustment: (bidCpm: number) => {
				return bidCpm * 1.05;
			},
		};
	}

	if (window.guardian.config.switches.prebidImproveDigital) {
		// Add placement ID for Improve Digital, reading from the bid response
		const REGEX_PID = new RegExp(/placement_id=\\?"(\d+)\\?"/);
		window.pbjs.bidderSettings.improvedigital = {
			adserverTargeting: [
				{
					key: 'hb_pid',
					val(bidResponse) {
						if (!isString(bidResponse.ad)) return undefined;

						const matches = REGEX_PID.exec(bidResponse.ad);
						const pid = matches?.[1];
						return pid;
					},
				},
			],
			suppressEmptyKeys: true,
		};

		pbjsConfig.improvedigital = {
			usePrebidSizes: true,
		};
	}

	window.pbjs.setConfig(pbjsConfig);

	// Adjust slot size when prebid ad loads
	window.pbjs.onEvent('bidWon', (data) => {
		const { width, height, adUnitCode } = data;

		if (!width || !height || !adUnitCode) {
			return;
		}

		const size: AdSize = createAdSize(width, height); // eg. [300, 250]
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
const requestBids = async (
	advert: Advert,
	slotFlatMap?: SlotFlatMap,
): Promise<void> => {
	if (!initialised) {
		return requestQueue;
	}

	if (!dfpEnv.hbImpl.prebid) {
		return requestQueue;
	}

	// prepare-prebid already waits for consent so this should resolve immediately
	const adUnits = await onConsent()
		.then((consentState) => {
			// calculate this once before mapping over
			const pageTargeting = getPageTargeting(consentState);
			return getHeaderBiddingAdSlots(advert, slotFlatMap)
				.map((slot) => new PrebidAdUnit(advert, slot, pageTargeting))
				.filter((adUnit) => !adUnit.isEmpty());
		})
		.catch((e) => {
			// silently fail
			log('commercial', 'Failed to execute prebid onConsent', e);
			return [];
		});

	if (adUnits.length === 0) {
		return requestQueue;
	}

	const eventTimer = EventTimer.get();

	requestQueue = requestQueue
		.then(
			() =>
				new Promise<void>((resolve) => {
					window.pbjs?.que.push(() => {
						adUnits.forEach((adUnit) => {
							if (isString(adUnit.code))
								eventTimer.trigger(
									'prebidStart',
									stripDfpAdPrefixFrom(adUnit.code),
								);
						});
						window.pbjs?.requestBids({
							adUnits,
							bidsBackHandler() {
								if (isString(adUnits[0].code))
									window.pbjs?.setTargetingForGPTAsync([
										adUnits[0].code,
									]);

								adUnits.forEach((adUnit) => {
									if (isString(adUnit.code))
										eventTimer.trigger(
											'prebidEnd',
											stripDfpAdPrefixFrom(adUnit.code),
										);
								});

								resolve();
							},
						});
					});
				}),
		)
		.catch((e) => {
			// silently fail
			log('commercial', 'Failed to execute Request queue', e);
		});

	return requestQueue;
};

export const prebid = { initialise, requestBids };
