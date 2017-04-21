define([
    'Promise',
    'lib/config',
    'lib/load-script',
    'commercial/modules/commercial-features',
    'commercial/modules/build-page-targeting',
    'commercial/modules/dfp/dfp-env'
], function(
    Promise,
    config,
    loadScript,
    commercialFeatures,
    buildPageTargeting,
    dfpEnv
){

    function setupSonobi(start, stop) {
        start();

        // Setting the async property to false will _still_ load the script in
        // a non-blocking fashion but will ensure it is executed before googletag
        loadScript.loadScript(config.libs.sonobi, { async: false }).then(catchPolyfillErrors).then(stop);
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

    function init(start, stop) {
        if (dfpEnv.sonobiEnabled && commercialFeatures.dfpAdvertising) {
            buildPageTargeting();
            setupSonobi(start, stop);
        }

        return Promise.resolve();
    }

    return {
        init: init
    };
});
