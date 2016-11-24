define([
    'Promise',
    'common/modules/commercial/commercial-features',
    'commercial/modules/dfp/dfp-env',
    'lodash/functions/memoize'
], function(
    Promise,
    commercialFeatures,
    dfpEnv,
    memoize
){
    var setupSonobi = memoize(function () {
        return Promise.resolve(require(['js!sonobi.js']));
    });

    function init() {
        return dfpEnv.sonobiEnabled && commercialFeatures.dfpAdvertising ? setupSonobi() : Promise.resolve();
    }

    return {
        init: init
    };
});
