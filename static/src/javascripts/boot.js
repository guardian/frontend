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
    'lodash/collections/map',
    'lodash/collections/forEach',
    'domReady',
    'common/utils/ajax-promise'
], function (
    Promise,
    map,
    forEach,
    domReady,
    ajaxPromise
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

    var curlConfig = window.curlConfig;
    var resolveModuleId = function (moduleId) {
        return curlConfig.paths[moduleId];
    };

    var preFetch = function (moduleIds) {
        if (isDev) {
            // We don't prefetch in dev because curl won't recognise the anonymous
            // module definition when we execute it.
            return Promise.resolve([]);
        } else {
            var urls = map(moduleIds, resolveModuleId);
            // IE 8 and 9 don't support requests that are cross origin *and*
            // cross scheme due to limitations with XDomainRequest. Thus, we
            // make all URLs protocol relative.
            // See http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
            // If testing in dev, disable cross origin and provide an absolute
            // url.
            var urlToProtocolRelative = function (url) { return url.replace(/^https?:/, ''); };
            var protocolRelativeUrls = map(urls, urlToProtocolRelative);
            return Promise.all(map(protocolRelativeUrls, function (url) {
                return ajaxPromise({
                    url: url,
                    // We have to override the type because otherwise reqwest
                    // will infer this as JS and eval it :-(
                    // See https://github.com/ded/reqwest/issues/131
                    type: 'html',
                    crossOrigin: true
                });
            }))
                // We want the app to run even if prefetching fails.
                .catch(function (error) {
                    /* eslint-disable no-console */
                    var console = window.console;
                    if (console && console.error) {
                        console.error('Caught error while prefetching.', error.stack);
                    }
                    /* eslint-enable no-console */
                    return [];
                });
        }
    };

    var shouldRunEnhance = guardian.isModernBrowser;

    var isDev = config.page.isDev;
    var commercialResponsesPromise = preFetch(['bootstraps/commercial']);
    var enhancedModuleIds = [
        'enhanced-vendor',
        'bootstraps/enhanced/main'
    ];
    var enhancedResponsesPromise = (
        shouldRunEnhance
            ? preFetch(enhancedModuleIds)
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
