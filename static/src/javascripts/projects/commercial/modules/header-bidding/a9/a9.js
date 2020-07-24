// @flow strict

import config from 'lib/config';
import { onConsentChange, oldCmp } from '@guardian/consent-management-platform';
import { shouldUseSourcepointCmp } from 'commercial/modules/cmp/sourcepoint';

import { Advert } from 'commercial/modules/dfp/Advert';
import { getHeaderBiddingAdSlots } from 'commercial/modules/header-bidding/slot-config';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';

import type {
    HeaderBiddingSize,
    HeaderBiddingSlot,
} from 'commercial/modules/header-bidding/types';

class A9AdUnit {
    slotID: ?string;
    slotName: ?string;
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

let initialised: boolean = false;
let requestQueue: Promise<void> = Promise.resolve();

const bidderTimeout: number = 1500;
const SOURCEPOINT_ID: string = '5edf9a821dc4e95986b66df4';

const initialise = (): void => {
    const onCMPConsentNotification = shouldUseSourcepointCmp()
        ? onConsentChange
        : oldCmp.onIabConsentNotification;

    onCMPConsentNotification(state => {
        let canRun: boolean;
        if (state.ccpa) {
            // CCPA mode
            canRun = !state.doNotSell;
        } else if (state.tcfv2) {
            // TCFv2 mode
            if (
                typeof state.tcfv2.customVendors[SOURCEPOINT_ID] !== 'undefined'
            ) {
                canRun = state.tcfv2.customVendors[SOURCEPOINT_ID];
            } else {
                canRun = Object.values(state.tcfv2.consents).every(Boolean);
            }
        } else {
            // TCFv1 mode
            canRun = state[1] && state[2] && state[3] && state[4] && state[5];
        }

        if (!initialised && canRun) {
            initialised = true;
            window.apstag.init({
                pubID: config.get('page.a9PublisherId'),
                adServer: 'googletag',
                bidTimeout: bidderTimeout,
            });
        }
    });
};

// slotFlatMap allows you to dynamically interfere with the PrebidSlot definition
// for this given request for bids.
const requestBids = (
    advert: Advert,
    slotFlatMap?: HeaderBiddingSlot => HeaderBiddingSlot[]
): Promise<void> => {
    if (!initialised) {
        return requestQueue;
    }

    if (!dfpEnv.hbImpl.a9) {
        return requestQueue;
    }

    const adUnits: Array<A9AdUnit> = getHeaderBiddingAdSlots(
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
