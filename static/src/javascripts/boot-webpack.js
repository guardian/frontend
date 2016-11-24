/*
 This module is responsible for booting the application. It is concatenated with
 curl into app-webpack.js

 We download the bundles in parallel, but they must be executed
 sequentially because each bundle assumes dependencies from the previous
 bundle.

 Once a bundle has been executed, all of its modules have been registered.
 Now we can safely require one of those modules.

 Unfortunately we can't do all of this using the curl API, so we use a
 combination of ajax/eval/curl instead.

 Bundles we need to run: commercial + enhanced

 Only if we detect we should run enhance.

 Standard is bundled separately by Webpack and included as a preload script in
 CurlConfig
 */

define([
    'Promise',
    'domReady',
    'common/utils/raven'
], function (
    Promise,
    domReady,
    raven
) {
    // curl’s promise API is broken, so we must cast it to a real Promise
    // https://github.com/cujojs/curl/issues/293
    var promiseRequire = function (moduleIds) {
        return Promise.resolve(require(moduleIds));
    };

    var guardian = window.guardian;
    var config = guardian.config;

    var domReadyPromise = new Promise(function (resolve) { domReady(resolve); });

    var bootCommercial = function () {
        if (!config.switches.commercial) {
            return;
        }

        if (config.page.isDev) {
            guardian.adBlockers.onDetect.push(function (isInUse) {
                var needsMessage = isInUse && window.console && window.console.warn;
                var message = 'Do you have an adblocker enabled? Commercial features might fail to run, or throw exceptions.';
                if (needsMessage) {
                    window.console.warn(message);
                }
            });
        }

        return promiseRequire(['bootstraps/commercial'])
            .then(raven.wrap(
                { tags: { feature: 'commercial' } },
                function (commercial) {
                    commercial.init();
                }
            ));
    };

    var bootEnhanced = function () {
        if (guardian.isEnhanced) {
            return promiseRequire(['bootstraps/enhanced/main'])
                .then(function (boot) {
                    boot();
                });
        }
    };

    domReadyPromise
        .then(bootCommercial)
        .then(bootEnhanced);
});
