// @flow strict

import config from 'lib/config';
import { Advert } from 'commercial/modules/dfp/Advert';
import { getPrebidAdSlots } from 'commercial/modules/prebid/slot-config';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';

import type { PrebidSize, PrebidSlot } from 'commercial/modules/prebid/types';

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

const initialise = (): void => {
    initialised = true;

    window.apstag.init({
        pubID: '3332',
        adServer: 'googletag',
        bidTimeout: 2e3,
    });
};

const requestBids = (
    advert: Advert,
    slotFlatMap?: PrebidSlot => PrebidSlot[]
): Promise<void> => {
    if (!initialised) {
        return requestQueue;
    }

    if (dfpEnv.externalDemand !== 'a9' && dfpEnv.externalDemand !== 'all') {
        return requestQueue;
    }

    const adUnits: Array<A9AdUnit> = getPrebidAdSlots(advert.id, slotFlatMap)
        .map(slot => new A9AdUnit(advert, slot))
        .filter(adUnit => !adUnit.isEmpty());

    if (adUnits.length === 0) {
        return requestQueue;
    }

    requestQueue = requestQueue
        .then(
            () =>
                new Promise(resolve => {
                    console.log('A9 CALL FETCH BIDS', { slots: adUnits });
                    window.apstag.fetchBids({ slots: adUnits }, bids => {
                        console.log('A9 BIDS received', bids);
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
