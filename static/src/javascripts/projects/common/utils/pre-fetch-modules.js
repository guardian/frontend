define([
    'lodash/collections/map',
    'common/utils/ajax-promise'
], function (
    map,
    ajaxPromise
) {
    var curlConfig = window.curlConfig;
    var resolveModuleId = function (moduleId) {
        return curlConfig.paths[moduleId];
    };

    var guardian = window.guardian;
    var isDev = guardian.config.page.isDev;
    var preFetchModules = function (moduleIds) {
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

    return preFetchModules;
});
