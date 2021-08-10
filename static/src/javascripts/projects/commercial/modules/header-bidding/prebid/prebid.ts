import { EventTimer } from '@guardian/commercial-core';
import { isString, log } from '@guardian/libs';
import { captureCommercialMetrics } from 'commercial/commercial-metrics';
import type { Advert } from 'commercial/modules/dfp/Advert';
import config from '../../../../../lib/config';
import { dfpEnv } from '../../dfp/dfp-env';
import { getAdvertById } from '../../dfp/get-advert-by-id';
import { getHeaderBiddingAdSlots } from '../slot-config';
import { stripDfpAdPrefixFrom } from '../utils';
import { bids } from './bid-config';
import { priceGranularity } from './price-config';
import { pubmatic } from './pubmatic';

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
	priceGranularity: typeof priceGranularity;
	userSync: UserSync;
	consentManagement?: ConsentManagement;
	realTimeData?: unknown;
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

type BuyerTargetting<T> = {
	key: string;
	val: (bidResponse: DeepPartial<T>) => string | null | undefined;
};

// https://docs.prebid.org/dev-docs/publisher-api-reference/bidderSettings.html
type BidderSetting<T = Record<string, unknown>> = {
	adserverTargeting: Array<BuyerTargetting<T>>;
	bidCpmAdjustment: (n: number) => number;
	suppressEmptyKeys: boolean;
	sendStandardTargeting: boolean;
};

type BidderSettings = {
	standard?: never; // prevent overriding the default settings
	xhb?: Partial<BidderSetting<XaxisBidResponse>>;
	improvedigital?: Partial<BidderSetting>;
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
			getConfig: (
				item?: string,
			) => PbjsConfig & {
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

const bidderTimeout = 1500;

class PrebidAdUnit {
	code: string | null | undefined;
	bids: PrebidBid[] | null | undefined;
	mediaTypes: PrebidMediaTypes | null | undefined;

	constructor(advert: Advert, slot: HeaderBiddingSlot) {
		this.code = advert.id;
		this.bids = bids(advert.id, slot.sizes);
		this.mediaTypes = { banner: { sizes: slot.sizes } };
		log('commercial', `PrebidAdUnit ${this.code}`, this.bids);
	}

	isEmpty() {
		return this.code == null;
	}
}

let requestQueue: Promise<void> = Promise.resolve();
let initialised = false;

const initialise = (window: Window, framework = 'tcfv2'): void => {
	if (!window.pbjs) {
		console.warn('window.pbjs not found on window');
		return void 0; // We couldn’t initialise
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
			priceGranularity,
			userSync,
		},
	);

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

	window.pbjs.setConfig(pbjsConfig);

	if (config.get('switches.prebidAnalytics', false)) {
		window.pbjs.enableAnalytics([
			{
				provider: 'gu',
				options: {
					ajaxUrl: window.guardian.config.page.ajaxUrl,
					pv: window.guardian.ophan.pageViewId,
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

	if (config.get('switches.prebidImproveDigital', false)) {
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
	}

	// Adjust slot size when prebid ad loads
	window.pbjs.onEvent('bidWon', (data) => {
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

		if (data.bidderCode === 'improvedigital') captureCommercialMetrics();
	});
};

// slotFlatMap allows you to dynamically interfere with the PrebidSlot definition
// for this given request for bids.
const requestBids = (
	advert: Advert,
	slotFlatMap?: SlotFlatMap,
): Promise<void> => {
	if (!initialised) {
		return requestQueue;
	}

	if (!dfpEnv.hbImpl.prebid) {
		return requestQueue;
	}

	const adUnits: PrebidAdUnit[] = getHeaderBiddingAdSlots(advert, slotFlatMap)
		.map((slot) => new PrebidAdUnit(advert, slot))
		.filter((adUnit) => !adUnit.isEmpty());

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
