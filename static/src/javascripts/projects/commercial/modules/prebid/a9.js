// @flow strict

import config from 'lib/config';
import { Advert } from 'commercial/modules/dfp/Advert';
import { slots } from 'commercial/modules/prebid/slot-config';
import type {
    PrebidSize,
    PrebidSlot,
} from 'commercial/modules/prebid/types';

class A9AdUnit {
    slotID: ?string;
    slotName: ?string;
    sizes: PrebidSize[];

    constructor(advert: Advert, slot: PrebidSlot) {
        this.slotID = advert.id;
        this.slotName = config.get('page.adUnit');
        this.sizes = slot.sizes;
    }

    isEmpty() {
        return this.slotID == null;
    }
}

let requestQueue: Promise<void> = Promise.resolve();
let initialised: boolean = false;

const initialise = (window): void => {
    initialised = true;

    //Initialize the Library
    window.apstag.init({
        pubID: '3332',
        adServer: 'googletag',
        bidTimeout: 2e3
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
    /*if (dfpEnv.externalDemand !== 'a9') {
        return requestQueue;
    }*/

    const adUnits: Array<A9AdUnit> = slots(
        advert.id,
        config.get('page.contentType', '')
    )
        .map(effectiveSlotFlatMap)
        .reduce((acc, elt) => acc.concat(elt), []) // the "flat" in "flatMap"
        .map(slot => new A9AdUnit(advert, slot))
        .filter(adUnit => !adUnit.isEmpty());

    console.log("A9 AD UNITS", adUnits);

    if (adUnits.length === 0) {
        return requestQueue;
    }

    requestQueue = requestQueue
        .then(
            () =>
                new Promise(resolve => {
                    console.log("A9 CALL FETCH BIDS", {slots: adUnits});
                    window.apstag.fetchBids({slots: adUnits}, function(bids) {
                        console.log("A9 BIDS received", bids);
                        window.googletag.cmd.push(function(){
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
