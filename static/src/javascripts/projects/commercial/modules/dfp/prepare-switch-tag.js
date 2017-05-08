import Promise from 'Promise';
import config from 'lib/config';
import loadScript from 'lib/load-script';
import reportError from 'lib/report-error';
import timeout from 'lib/timeout';
import adSizes from 'commercial/modules/ad-sizes';
import commercialFeatures from 'commercial/modules/commercial-features';
import dfpEnv from 'commercial/modules/dfp/dfp-env';
import uniq from 'lodash/arrays/uniq';
// The view id is used as the unique load id, for easier Switch log querying.
var loadId = window.esi && window.esi.viewId;
var REQUEST_TIMEOUT = 5000;

function setupSwitch(start, stop) {
    start();

    // Setting the async property to false will _still_ load the script in
    // a non-blocking fashion but will ensure it is executed before googletag
    loadScript.loadScript(config.libs.switch, {
        async: false
    }).then(setupLoadId).then(stop);
}

// Set Switch's load id to the value of the ophan page view id. This id links the js
// ad retrieval call to the pre-flight ad call made by the edge node (Fastly).
function setupLoadId() {
    var __switch_zero = window.__switch_zero || {};
    __switch_zero.units = __switch_zero.units || [];
    __switch_zero.commands = __switch_zero.commands || [];

    __switch_zero.commands.push(function() {
        __switch_zero.setLoadId(loadId);
        __switch_zero.setAdserverDomain("delivery.guardian.switchadhub.com");
    });
}

// The switch api's callSwitch function will perform the retrieval of a pre-flight ad call,
// using the load id that has been previously set with setupLoadId.
function callSwitch() {
    var __switch_zero = window.__switch_zero;

    if (__switch_zero) {
        try {
            __switch_zero.commands.push(function() {
                __switch_zero.callSwitch();
            });
        } catch (error) {
            reportError(error, {
                feature: 'commercial'
            }, false);
        }
    }
}

// Returns an array of valid Switch ad unit ids.
function findAdUnitIds(sizes) {
    return uniq(sizes
        .map(function(size) {
            var sizeName = size[0] + 'x' + size[1],
                adSizeDefinition = adSizes[sizeName] || {};

            return adSizeDefinition.switchUnitId;
        })
        .filter(function(id) {
            return !isNaN(id);
        }));
}


// Whenever fill-advert-slots calls define-slot, a server-rendered html ad slot is being registered.
// Whenever a module calls create-slot, a slot is dynamically inserted onto the page.
//
// Dynamically constructed slots that are made using create-slot are not supported here,
// until callSwitch can handle lazy loading.
function pushAdUnit(dfpDivId, sizeMapping) {

    var __switch_zero = window.__switch_zero;
    var promises = [];

    if (__switch_zero) {
        var adUnitIds = findAdUnitIds(sizeMapping.size);

        adUnitIds.forEach(function(adUnitId) {
            if (adUnitId) {
                promises.push(new Promise(function(resolve) {
                    __switch_zero.units.push({
                        dfpDivId: dfpDivId,
                        switchAdUnitId: adUnitId,
                        deliveryCallback: resolve
                    });
                }));
            }
        });
    }

    return timeout(REQUEST_TIMEOUT, Promise.all(promises))
        .catch(function() {
            // The display needs to be called, even in the event of an error.
        });
}

function init(start, stop) {
    if (dfpEnv.preFlightAdCallEnabled && commercialFeatures.dfpAdvertising) {
        setupSwitch(start, stop);
    }

    return Promise.resolve();
}

export default {
    init: init,
    callSwitch: callSwitch,
    pushAdUnit: pushAdUnit
};
