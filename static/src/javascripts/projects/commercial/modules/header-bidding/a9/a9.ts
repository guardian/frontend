import type { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { getHeaderBiddingAdSlots } from 'commercial/modules/header-bidding/slot-config';
import type {
    HeaderBiddingSize,
    HeaderBiddingSlot,
} from 'commercial/modules/header-bidding/types';
import config from 'lib/config';

class A9AdUnit {
    slotID: string | null | undefined;

    slotName: string | null | undefined;

    sizes: HeaderBiddingSize[];

    constructor(advert: Advert, slot: HeaderBiddingSlot) {
        this.slotID = advert.id;
        this.slotName = config.get('page.adUnit');
        this.sizes = slot.sizes;
    }

    isEmpty() {
        return this.slotID == null;
    }
}

let initialised = false;
let requestQueue: Promise<void> = Promise.resolve();

const bidderTimeout = 1500;

const initialise = (): void => {
    if (!initialised) {
        initialised = true;
        window.apstag.init({
            pubID: config.get('page.a9PublisherId'),
            adServer: 'googletag',
            bidTimeout: bidderTimeout,
        });
    }
};

// slotFlatMap allows you to dynamically interfere with the PrebidSlot definition
// for this given request for bids.
const requestBids = (
    advert: Advert,
    slotFlatMap?: (arg0: HeaderBiddingSlot) => HeaderBiddingSlot[]
): Promise<void> => {
    if (!initialised) {
        return requestQueue;
    }

    if (!dfpEnv.hbImpl.a9) {
        return requestQueue;
    }

    const adUnits: A9AdUnit[] = getHeaderBiddingAdSlots(advert, slotFlatMap)
        .map((slot) => new A9AdUnit(advert, slot))
        .filter((adUnit) => !adUnit.isEmpty());

    if (adUnits.length === 0) {
        return requestQueue;
    }

    requestQueue = requestQueue
        .then(
            () =>
                new Promise((resolve) => {
                    window.apstag.fetchBids({ slots: adUnits }, () => {
                        window.googletag.cmd.push(() => {
                            window.apstag.setDisplayBids();
                            resolve();
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

export const _ = {
    resetModule: () => {
        initialised = false;
        requestQueue = Promise.resolve();
    },
};
