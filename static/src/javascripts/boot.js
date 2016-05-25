/*
This module is responsible for booting the application. It is concatenated with
curl and bootstraps/standard into app.js

We download the bundles in parallel, but they must be executed
sequentially because each bundle assumes dependencies from the previous
bundle.

Once a bundle has been executed, all of its modules have been registered.
Now we can safely require one of those modules.

Unfortunately we can't do all of this using the curl API, so we use a
combination of ajax/eval/curl instead.

Bundles we need to run: commercial + enhanced

Only if we detect we should run enhance.
 */

define([
    'Promise',
    'domReady'
], function (
    Promise,
    domReady
) {
    // curl’s promise API is broken, so we must cast it to a real Promise
    // https://github.com/cujojs/curl/issues/293
    var promiseRequire = function (moduleIds) {
        return Promise.resolve(require(moduleIds));
    };

    var guardian = window.guardian;
    var config = guardian.config;

    var domReadyPromise = new Promise(function (resolve) { domReady(resolve); });

    var bootStandard = function () {
        return promiseRequire(['bootstraps/standard/main'])
            .then(function (boot) { boot(); });
    };

    var bootCommercial = function () {
        return promiseRequire(['raven'])
            .then(function (raven) {
                // Preference pages are served via HTTPS for service worker support.
                // These pages must not have mixed (HTTP/HTTPS) content, so
                // we disable ads (until the day comes when all ads are HTTPS).
                if (config.switches.commercial && !config.page.isPreferencesPage) {
                    return promiseRequire(['bootstraps/commercial'])
                        .then(raven.wrap(
                            { tags: { feature: 'commercial' } },
                            function (commercial) {
                                commercial.init();
                            }
                        ));
                }
            });
    };

    var bootEnhanced = function () {
        if (guardian.isEnhanced) {
            return promiseRequire(['bootstraps/enhanced/main'])
                .then(function (boot) {
                    boot();
                });
        } else Promise.resolve();
    };

    domReadyPromise
        .then(bootStandard)
        .then(bootCommercial)
        .then(bootEnhanced);
});
