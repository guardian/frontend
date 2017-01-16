define([
    'Promise',
    'common/utils/config',
    'common/modules/commercial/commercial-features',
    'commercial/modules/dfp/dfp-env',
    'lodash/functions/memoize',
    'common/utils/load-script'
], function(
    Promise,
    config,
    commercialFeatures,
    dfpEnv,
    memoize,
    loadScript
){
    var setupSonobi = memoize(function () {
        return loadScript(config.libs.sonobi).then(catchPolyfillErrors);
    });

    // Wrap the native implementation of getOwnPropertyNames in a try-catch. If any polyfill attempts
    // to re-implement this function, and doesn't consider the "access permissions" issue that exists in IE11,
    // then the resulting "Access Denied" error will be caught. Without this, the error is always delivered to Sentry,
    // but does not pass through window.onerror. More info here: https://github.com/paulmillr/es6-shim/issues/333
    function catchPolyfillErrors(){

        // Skip polyfill error-catch in dev environments.
        if (config.page.isDev){
            return Promise.resolve();
        }

        var nativeGetOwnPropertyNames = Object.getOwnPropertyNames;
        Object.getOwnPropertyNames = function(obj){
            try {
                return nativeGetOwnPropertyNames(obj);
            } catch (e) {
                // continue regardless of error
                return [];
            }
        };
        return Promise.resolve();
    }

    function init() {
        return dfpEnv.sonobiEnabled && commercialFeatures.dfpAdvertising ? setupSonobi() : Promise.resolve();
    }

    return {
        init: init
    };
});
