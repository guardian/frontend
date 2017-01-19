define([
    'Promise',
    'common/utils/config',
    'common/utils/load-script',
    'common/modules/commercial/commercial-features',
    'commercial/modules/dfp/dfp-env',
    'common/utils/load-script'
], function(
    Promise,
    config,
    loadScript,
    commercialFeatures,
    dfpEnv,
    loadScript
){

    function setupSonobi() {
        // Setting the async property to false will _still_ load the script in
        // a non-blocking fashion but will ensure it is executed before googletag
        return loadScript(config.libs.sonobi, { async: false }).then(catchPolyfillErrors);
    }

    // Wrap the native implementation of getOwnPropertyNames in a try-catch. If any polyfill attempts
    // to re-implement this function, and doesn't consider the "access permissions" issue that exists in IE11,
    // then the resulting "Access Denied" error will be caught. Without this, the error is always delivered to Sentry,
    // but does not pass through window.onerror. More info here: https://github.com/paulmillr/es6-shim/issues/333
    function catchPolyfillErrors(){

        // Skip polyfill error-catch in dev environments.
        if (config.page.isDev){
            return;
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
    }

    function init() {
        return dfpEnv.sonobiEnabled && commercialFeatures.dfpAdvertising ? setupSonobi() : Promise.resolve();
    }

    return {
        init: init
    };
});
