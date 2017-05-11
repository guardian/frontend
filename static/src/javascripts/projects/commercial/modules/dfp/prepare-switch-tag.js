// @flow

/* eslint camelcase: 0 */
/* eslint no-underscore-dangle: 0 */

import config from 'lib/config';
import { loadScript } from 'lib/load-script';
import reportError from 'lib/report-error';
import timeout from 'lib/timeout';
import adSizes from 'commercial/modules/ad-sizes';
import commercialFeatures from 'commercial/modules/commercial-features';
import dfpEnv from 'commercial/modules/dfp/dfp-env';
import uniq from 'lodash/arrays/uniq';
// The view id is used as the unique load id, for easier Switch log querying.
const loadId = window.esi && window.esi.viewId;
const REQUEST_TIMEOUT = 5000;

// Set Switch's load id to the value of the ophan page view id. This id links the js
// ad retrieval call to the pre-flight ad call made by the edge node (Fastly).
const setupLoadId = () => {
    const __switch_zero = window.__switch_zero || {};
    __switch_zero.units = __switch_zero.units || [];
    __switch_zero.commands = __switch_zero.commands || [];

    __switch_zero.commands.push(() => {
        __switch_zero.setLoadId(loadId);
        __switch_zero.setAdserverDomain('delivery.guardian.switchadhub.com');
    });
};

const setupSwitch = (start: () => void, stop: () => void) => {
    start();

    // Setting the async property to false will _still_ load the script in
    // a non-blocking fashion but will ensure it is executed before googletag
    loadScript(config.libs.switch, {
        async: false,
    })
        .then(setupLoadId)
        .then(stop);
};

// The switch api's callSwitch function will perform the retrieval of a pre-flight ad call,
// using the load id that has been previously set with setupLoadId.
const callSwitch = () => {
    const __switch_zero = window.__switch_zero;

    if (__switch_zero) {
        try {
            __switch_zero.commands.push(() => {
                __switch_zero.callSwitch();
            });
        } catch (error) {
            reportError(
                error,
                {
                    feature: 'commercial',
                },
                false
            );
        }
    }
};

// Returns an array of valid Switch ad unit ids.
const findAdUnitIds = sizes =>
    uniq(
        sizes
            .map(size => {
                const sizeName = `${size[0]}x${size[1]}`;
                const adSizeDefinition = adSizes[sizeName] || {};

                return adSizeDefinition.switchUnitId;
            })
            .filter(id => !isNaN(id))
    );

// Whenever fill-advert-slots calls define-slot, a server-rendered html ad slot is being registered.
// Whenever a module calls create-slot, a slot is dynamically inserted onto the page.
//
// Dynamically constructed slots that are made using create-slot are not supported here,
// until callSwitch can handle lazy loading.
const pushAdUnit = (dfpDivId: string, sizeMapping: any) => {
    const __switch_zero = window.__switch_zero;
    const promises = [];

    if (__switch_zero) {
        const adUnitIds = findAdUnitIds(sizeMapping.sizes);

        adUnitIds.forEach(adUnitId => {
            if (adUnitId) {
                promises.push(
                    new Promise(resolve => {
                        __switch_zero.units.push({
                            dfpDivId,
                            switchAdUnitId: adUnitId,
                            deliveryCallback: resolve,
                        });
                    })
                );
            }
        });

        return timeout(REQUEST_TIMEOUT, Promise.all(promises)).catch(() => {
            // The display needs to be called, even in the event of an error.
        });
    }
    return Promise.resolve();
};

const init = (start: () => void, stop: () => void) => {
    if (dfpEnv.preFlightAdCallEnabled && commercialFeatures.dfpAdvertising) {
        setupSwitch(start, stop);
    }

    return Promise.resolve();
};

export default {
    init,
    callSwitch,
    pushAdUnit,
};
