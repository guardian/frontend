define([
    'common/modules/commercial/commercial-features',
    'commercial/modules/dfp/dfp-env'
], function(
    commercialFeatures,
    dfpEnv
){
    var prom = null;

    function setupSonobi() {
        return new Promise.resolve(require(['js!sonobi.js']));
    }

    function init() {
        if (!prom) {
            prom = dfpEnv.sonobiEnabled && commercialFeatures.dfpAdvertising ? setupSonobi() : Promise.resolve();
        }
        return prom;
    }

    return {
        init: init
    };
});
