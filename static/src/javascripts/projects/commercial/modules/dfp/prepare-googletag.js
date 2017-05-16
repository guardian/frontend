import qwery from 'qwery';
import raven from 'lib/raven';
import config from 'lib/config';
import loadScript from 'lib/load-script';
import fastdom from 'lib/fastdom-promise';
import commercialFeatures from 'commercial/modules/commercial-features';
import buildPageTargeting from 'commercial/modules/build-page-targeting';
import closeSlots from 'commercial/modules/close-disabled-slots';
import dfpEnv from 'commercial/modules/dfp/dfp-env';
import onSlotRender from 'commercial/modules/dfp/on-slot-render';
import onSlotLoad from 'commercial/modules/dfp/on-slot-load';
import performanceLogging from 'commercial/modules/dfp/performance-logging';
import 'commercial/modules/messenger/type';
import 'commercial/modules/messenger/get-stylesheet';
import 'commercial/modules/messenger/resize';
import 'commercial/modules/messenger/scroll';
import 'commercial/modules/messenger/viewport';
import 'commercial/modules/messenger/click';
import 'commercial/modules/messenger/background';

export default {
    init: init
};

function init(start, stop) {

    function setupAdvertising() {

        performanceLogging.addTag(dfpEnv.sonobiEnabled ? 'sonobi' : 'waterfall');

        window.googletag.cmd.push(
            start,
            setListeners,
            setPageTargeting,
            stop
        );

        // Just load googletag. Sonobi's wrapper will already be loaded, and googletag is already added to the window by sonobi.
        return loadScript.loadScript(config.libs.googletag, {
            async: false
        });
    }

    if (commercialFeatures.dfpAdvertising) {
        setupAdvertising()
            // A promise error here, from a failed module load,
            // could be a network problem or an intercepted request.
            // Abandon the init sequence.
            .catch(removeAdSlots);
        return Promise.resolve();
    }

    return removeAdSlots();
}

function setListeners() {
    performanceLogging.setListeners(window.googletag);

    var pubads = window.googletag.pubads();
    pubads.addEventListener('slotRenderEnded', raven.wrap(onSlotRender));
    pubads.addEventListener('slotOnload', raven.wrap(onSlotLoad));
}

function setPageTargeting() {
    var pubads = window.googletag.pubads();
    var targeting = buildPageTargeting();
    Object.keys(targeting).forEach(function(key) {
        pubads.setTargeting(key, targeting[key]);
    });
}

function removeAdSlots() {
    return closeSlots.init(true);
}
