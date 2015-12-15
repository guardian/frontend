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

Bundles we need to run: commercial + (enhanced-vendor + enhanced)*
* Only if we detect we should run enhance
 */

define([
    'Promise',
    'lodash/collections/forEach',
    'domReady',
    'common/utils/pre-fetch-modules'
], function (
    Promise,
    forEach,
    domReady,
    preFetchModules
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
        return domReadyPromise.then(function () {
            return promiseRequire(['bootstraps/standard/main']);
        });
    };

    var bootEnhanced = function () { return promiseRequire(['bootstraps/enhanced/main']); };

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



    var shouldRunEnhance = guardian.isModernBrowser;

    var commercialResponsesPromise = preFetchModules(['bootstraps/commercial']);
    var enhancedModuleIds = [
        'enhanced-vendor',
        'bootstraps/enhanced/main'
    ];
    var enhancedResponsesPromise = (
        shouldRunEnhance
            ? preFetchModules(enhancedModuleIds)
            : Promise.resolve()
    );

    var evalAll = function (strings) {
        forEach(strings, function (string) {
            eval(string);
        });
    };

    bootStandard()
        .then(function () {
            return commercialResponsesPromise
                .then(evalAll)
                // The require is async, we don't need to wait for it
                .then(function () { bootCommercial(); });
        })
        .then(function () {
            if (shouldRunEnhance) {
                return enhancedResponsesPromise
                    .then(evalAll)
                    // The require is async, we don't need to wait for it
                    .then(function () { bootEnhanced(); });
            }
        });
});
