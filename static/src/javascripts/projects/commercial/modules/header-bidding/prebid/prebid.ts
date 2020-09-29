// @flow strict

import config from "lib/config";
import { Advert } from "commercial/modules/dfp/Advert";
import { dfpEnv } from "commercial/modules/dfp/dfp-env";
import { bids } from "commercial/modules/header-bidding/prebid/bid-config";
import { getHeaderBiddingAdSlots } from "commercial/modules/header-bidding/slot-config";
import { priceGranularity } from "commercial/modules/header-bidding/prebid/price-config";
import { getAdvertById } from "commercial/modules/dfp/get-advert-by-id";
import { PrebidBid, PrebidMediaTypes, HeaderBiddingSlot } from "commercial/modules/header-bidding/types";
import { PrebidPriceGranularity } from "commercial/modules/header-bidding/prebid/price-config";

type EnableAnalyticsConfig = {
  provider: string;
  options: {
    ajaxUrl: string;
    pv: string;
  };
};

type GDPRConfig = {
  cmpApi: string;
  timeout: number;
  allowAuctionWithoutConsent: boolean;
};

type USPConfig = {
  timeout: number;
};

type ConsentManagement = {
  gdpr: GDPRConfig;
  usp: USPConfig;
};

type UserSync = {
  syncsPerBidder: number;
  filterSettings: {
    all: {
      bidders: string;
      filter: string;
    };
  };
} | {syncEnabled: false;};

type PbjsConfig = {
  bidderTimeout: number;
  priceGranularity: PrebidPriceGranularity;
  userSync: UserSync;
  consentManagement: ConsentManagement | false;
};

type XasisBuyerTargetting = {
  key: string;
  val: (arg0: {
    appnexus: {
      buyerMemberId: string;
    };
  }) => string;
};

type XasisHeaderBidderConfig = {
  adserverTargeting: Array<XasisBuyerTargetting>;
};

type BidderSettings = {
  xhb: XasisHeaderBidderConfig;
};

type PbjsEvent = "bidWon";

type PbjsEventData = {
  width: number;
  height: number;
  adUnitCode: string;
};

type PbjsEventHandler = (arg0: PbjsEventData) => void;

const bidderTimeout: number = 1500;

const consentManagement: ConsentManagement = {
  gdpr: {
    cmpApi: 'iab',
    timeout: 200,
    allowAuctionWithoutConsent: true
  },
  usp: {
    timeout: 1500
  }
};

class PrebidAdUnit {

  code: string | null | undefined;
  bids: PrebidBid[] | null | undefined;
  mediaTypes: PrebidMediaTypes | null | undefined;

  constructor(advert: Advert, slot: HeaderBiddingSlot) {
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
    setConfig: (arg0: PbjsConfig) => void;
    bidderSettings: BidderSettings;
    enableAnalytics: (arg0: [EnableAnalyticsConfig]) => void;
    onEvent: (arg0: PbjsEvent, arg1: PbjsEventHandler) => void;
  };
}): void => {
  initialised = true;

  const userSync = config.get('switches.prebidUserSync', false) ? {
    syncsPerBidder: 0, // allow all syncs
    filterSettings: {
      all: {
        bidders: '*', // allow all bidders to sync by iframe or image beacons
        filter: 'include'
      }
    }
  } : { syncEnabled: false };

  const pbjsConfig: PbjsConfig = Object.assign({}, {
    bidderTimeout,
    priceGranularity,
    userSync
  }, config.get('switches.consentManagement', false) ? { consentManagement } : {});

  window.pbjs.setConfig(pbjsConfig);

  if (config.get('switches.prebidAnalytics', false)) {
    window.pbjs.enableAnalytics([{
      provider: 'gu',
      options: {
        ajaxUrl: config.get('page.ajaxUrl'),
        pv: config.get('ophan.pageViewId')
      }
    }]);
  }

  // This creates an 'unsealed' object. Flows
  // allows dynamic assignment.
  window.pbjs.bidderSettings = {};

  if (config.get('switches.prebidXaxis', false)) {
    window.pbjs.bidderSettings.xhb = {
      adserverTargeting: [{
        key: 'hb_buyer_id',
        val(bidResponse): string {
          // flowlint sketchy-null-mixed:warn
          return bidResponse.appnexus ? bidResponse.appnexus.buyerMemberId : '';
        }
      }]
    };
  }

  // Adjust slot size when prebid ad loads
  window.pbjs.onEvent('bidWon', data => {
    const {
      width,
      height,
      adUnitCode
    } = data;

    if (!width || !height || !adUnitCode) {
      return;
    }

    const size = [width, height]; // eg. [300, 250]
    const advert: Advert | null | undefined = getAdvertById(adUnitCode);

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
const requestBids = (advert: Advert, slotFlatMap?: (arg0: HeaderBiddingSlot) => HeaderBiddingSlot[]): Promise<void> => {
  if (!initialised) {
    return requestQueue;
  }

  if (!dfpEnv.hbImpl.prebid) {
    return requestQueue;
  }

  const adUnits: Array<PrebidAdUnit> = getHeaderBiddingAdSlots(advert, slotFlatMap).map(slot => new PrebidAdUnit(advert, slot)).filter(adUnit => !adUnit.isEmpty());

  if (adUnits.length === 0) {
    return requestQueue;
  }

  requestQueue = requestQueue.then(() => new Promise(resolve => {
    window.pbjs.que.push(() => {
      window.pbjs.requestBids({
        adUnits,
        bidsBackHandler() {
          window.pbjs.setTargetingForGPTAsync([adUnits[0].code]);
          resolve();
        }
      });
    });
  })).catch(() => {});

  return requestQueue;
};

export default {
  initialise,
  requestBids
};