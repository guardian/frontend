define([
    'Promise',
    'common/utils/config',
    'common/utils/load-script',
    'common/modules/commercial/commercial-features',
    'commercial/modules/dfp/dfp-env'
], function(
    Promise,
    config,
    loadScript,
    commercialFeatures,
    dfpEnv
){
    // The view id is used as the unique load id, for easier data querying.
    var loadId = window.esi && window.esi.viewId;

    function setupSwitch(start, stop) {
        start();

        // Setting the async property to false will _still_ load the script in
        // a non-blocking fashion but will ensure it is executed before googletag
        loadScript(config.libs.switch, { async: false }).then(setupLoadId).then(stop);
    }

    function setupLoadId(){
        var __switch_zero = window.__switch_zero || {};
        __switch_zero.units = __switch_zero.units || [];
        __switch_zero.commands = __switch_zero.commands || [];

        __switch_zero.commands.push(function () {
            __switch_zero.setLoadId(loadId);
            __switch_zero.setAdserverDomain("delivery.guardian.switchadhub.com");
        });
    }

    function callSwitch(){
        var __switch_zero = window.__switch_zero;

        if (__switch_zero) {
            __switch_zero.commands.push(function () {
                __switch_zero.callSwitch();
            });
        }
    }

    function pushAdUnit(dfpDivId, adUnitId) {
        var __switch_zero = window.__switch_zero;

        if (__switch_zero) {
            __switch_zero.units.push({
                dfpDivId: dfpDivId,
                switchAdUnitId: adUnitId
            });
        }
    }

    function init(start, stop) {
        if (dfpEnv.preFlightAdCallEnabled && commercialFeatures.dfpAdvertising) {
            setupSwitch(start, stop);
        }

        return Promise.resolve();
    }

    return {
        init: init,
        callSwitch: callSwitch,
        pushAdUnit: pushAdUnit
    };
});
