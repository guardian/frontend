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

require(['Promise', 'lodash/collections/map'], function (Promise, map) {
    var guardian = window.guardian;
    var config = guardian.config;

    var curlConfig = window.curlConfig;
    // TODO: dev
    var getPath = function (moduleId) { return curlConfig.paths[moduleId]; };

    var xhrFetch = function (url) {
        // TODO: handle errors
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function () { resolve(this); });
            xhr.open('GET', url);
            xhr.send();
        });
    };

    var xhrFetchAll = function (urls) {
        return Promise.all(map(urls, function (url) {
            return xhrFetch(url);
        }));
    };

    var commercialResponsesPromise = xhrFetchAll(map(['bootstraps/commercial'], getPath));
    var enhancedModuleIds = [
        'enhanced-vendor',
        'bootstraps/enhanced'
    ];
    var shouldRunEnhance = guardian.isModernBrowser;
    var enhancedResponsesPromise = (
        shouldRunEnhance
            ? xhrFetchAll(map(enhancedModuleIds, getPath))
            : Promise.resolve()
    );

    var executeResponses = function (responses) {
        responses.forEach(function (response) {
            eval(response.responseText);
        });
    };

    var bootEnhanced = function () { return Promise.resolve(require(['bootstraps/enhanced'])); };

    var bootCommercial = function () {
        return Promise.resolve(require(['raven']))
            .then(function (raven) {
                //
                // Commercial
                //

                // Preference pages are served via HTTPS for service worker support.
                // These pages must not have mixed (HTTP/HTTPS) content, so
                // we disable ads (until the day comes when all ads are HTTPS).
                if (config.switches.commercial && !config.page.isPreferencesPage) {
                    return Promise.resolve(
                        require(['bootstraps/commercial'])
                            .then(raven.wrap(
                                { tags: { feature: 'commercial' } },
                                function (commercial) {
                                    commercial.init();
                                }
                            ))
                    );
                }
            });
    };

    // We must cast promises because…
    // https://github.com/cujojs/curl/issues/293
    Promise.resolve(require(['bootstraps/standard', 'domReady!']))
        .then(function () {
            return commercialResponsesPromise.then(executeResponses)
                // The require is async, we don't need to wait for it
                .then(function () { bootCommercial(); });
        })
        .then(function () {
            if (shouldRunEnhance) {
                return enhancedResponsesPromise.then(executeResponses)
                    // The require is async, we don't need to wait for it
                    .then(function () { bootEnhanced(); });
            }
        });
});
