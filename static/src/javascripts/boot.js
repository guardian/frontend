/*
Bundles: commercial + (enhanced-vendor + enhanced)*
* Only if we detect we should run enhance

We download the bundles in parallel, but they must be executed
sequentially because each bundle assumes dependencies from the previous
bundle.

Once a bundle has been executed, all of its modules have been registered.
Now we can safely require one of those modules.

Unfortunately we can't do all of this using the curl API, so we use a
combination of ajax/eval/curl instead.
 */

define([
    'Promise',
    'lodash/collections/map',
    'lodash/collections/forEach'
], function (
    Promise,
    map,
    forEach
) {
    // We must cast promises because…
    // https://github.com/cujojs/curl/issues/293
    var promiseRequire = function (moduleIds) {
        return Promise.resolve(require(moduleIds));
    };

    var guardian = window.guardian;
    var config = guardian.config;

    var curlConfig = window.curlConfig;
    var resolveModuleId = function (moduleId) {
        var match = curlConfig.paths[moduleId];
        // In dev, there will be no match.
        return match ? match : (window.curlConfig.baseUrl + '/' + moduleId + '.js');
    };

    var xhrFetch = function (url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr);
                    } else {
                        reject(new Error('Bad response: ' + xhr.status + ' ' + xhr.statusText));
                    }
                }
            };
            xhr.send();
        });
    };

    var xhrFetchAll = function (urls) {
        return Promise.all(map(urls, function (url) {
            return xhrFetch(url);
        }));
    };

    var xhrFetchAllModules = function (moduleIds) {
        return xhrFetchAll(map(moduleIds, resolveModuleId));
    };

    var shouldRunEnhance = guardian.isModernBrowser;

    var commercialResponsesPromise = xhrFetchAllModules(['bootstraps/commercial']);
    var enhancedModuleIds = [
        'enhanced-vendor',
        'bootstraps/enhanced'
    ];
    var enhancedResponsesPromise = (
        shouldRunEnhance ? xhrFetchAllModules(enhancedModuleIds) : Promise.resolve()
    );

    var executeResponses = function (responses) {
        forEach(responses, function (response) {
            eval(response.responseText);
        });
    };

    var bootEnhanced = function () { return promiseRequire(['bootstraps/enhanced']); };

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

    promiseRequire(['bootstraps/standard', 'domReady!'])
        .then(function () {
            return commercialResponsesPromise
                .then(executeResponses)
                // The require is async, we don't need to wait for it
                .then(function () { bootCommercial(); });
        })
        .then(function () {
            if (shouldRunEnhance) {
                return enhancedResponsesPromise
                    .then(executeResponses)
                    // The require is async, we don't need to wait for it
                    .then(function () { bootEnhanced(); });
            }
        });
});
