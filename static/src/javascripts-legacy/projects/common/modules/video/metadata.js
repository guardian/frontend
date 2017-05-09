define([
    'lib/fetch',
    'lib/fetch-json',
    'lib/config'
], function (
    fetch,
    fetchJSON,
    config
) {
    function isGeoBlocked(el) {
        var source = el.currentSrc;

        // we currently only block to the uk
        // these files are placed in a special location
        if (source.indexOf('/ukonly/') !== -1) {
            return new Promise(function(resolve) {
                fetch(source, {
                    mode: 'cors',
                    method: 'head'
                }).then(function() {
                    resolve(false);
                }).catch(function (res) {
                    // videos are blocked at the CDN level
                    resolve(res.status === 403);
                });
            });
        } else {
            return new Promise(function (resolve) {
                resolve(false);
            });
        }
    }

    function getVideoInfo($el) {
        var shouldHideAdverts = $el.attr('data-block-video-ads') !== 'false';
        var embedPath = $el.attr('data-embed-path');

        // we need to look up the embedPath for main media videos
        var canonicalUrl = $el.attr('data-canonical-url') || (embedPath ? embedPath : null);

        return new Promise(function(resolve) {
            // We only have the canonical URL in videos embedded in articles / main media.
            // These are set to the safest defaults that will always play video.
            var defaultVideoInfo = {
                expired: false,
                shouldHideAdverts: shouldHideAdverts
            };

            if (!canonicalUrl) {
                resolve(defaultVideoInfo);
            } else {
                var url = config.page.ajaxUrl + '/' + canonicalUrl + '/info.json';

                fetchJSON(url, {
                    mode: 'cors',
                })
                    .then(resolve)
                    .catch(function() {
                        // if this fails, don't stop, keep going.
                        resolve(defaultVideoInfo);
                    });
            }
        });
    }

    return {
        isGeoBlocked: isGeoBlocked,
        getVideoInfo: getVideoInfo
    };
});
