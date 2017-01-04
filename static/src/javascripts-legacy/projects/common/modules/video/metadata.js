define([
    'common/utils/ajax',
    'common/utils/config',
    'Promise'
], function (
    ajax,
    config,
    Promise
) {
    function isGeoBlocked(el) {
        var source = el.currentSrc;

        // we currently only block to the uk
        // these files are placed in a special location
        if (source.indexOf('/ukonly/') !== -1) {
            return new Promise(function(resolve) {
                ajax({
                    url: source,
                    crossOrigin: true,
                    method: 'head'
                }).then(function() {
                    resolve(false);
                }, function (response) {
                    // videos are blocked at the CDN level
                    resolve(response.status === 403);
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
                var ajaxInfoUrl = config.page.ajaxUrl + '/' + canonicalUrl;

                ajax({
                    url: ajaxInfoUrl + '/info.json',
                    type: 'json',
                    crossOrigin: true
                }).then(function(videoInfo) {
                    resolve(videoInfo);
                }, function() {
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
