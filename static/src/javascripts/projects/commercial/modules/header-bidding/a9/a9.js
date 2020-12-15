

import config from 'lib/config';
import { getHeaderBiddingAdSlots } from 'commercial/modules/header-bidding/slot-config';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';


class A9AdUnit {
    slotID;
    slotName;
    sizes;

    constructor(advert, slot) {
        this.slotID = advert.id;
        this.slotName = config.get('page.adUnit');
        this.sizes = slot.sizes;
    }

    isEmpty() {
        return this.slotID == null;
    }
}

let initialised = false;
let requestQueue = Promise.resolve();

const bidderTimeout = 1500;

const initialise = () => {
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
    advert,
    slotFlatMap
) => {
    if (!initialised) {
        return requestQueue;
    }

    if (!dfpEnv.hbImpl.a9) {
        return requestQueue;
    }

    const adUnits = getHeaderBiddingAdSlots(
        advert,
        slotFlatMap
    )
        .map(slot => new A9AdUnit(advert, slot))
        .filter(adUnit => !adUnit.isEmpty());

    if (adUnits.length === 0) {
        return requestQueue;
    }

    requestQueue = requestQueue
        .then(
            () =>
                new Promise(resolve => {
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
