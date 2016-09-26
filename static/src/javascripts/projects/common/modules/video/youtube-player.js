define([
    'fastdom',
    'Promise',
    'common/utils/load-script'
], function (
    fastdom,
    Promise,
    loadScript
) {
    var scriptId = 'youtube-player';
    var scriptSrc = 'http://www.youtube.com/player_api';
    var promise = new Promise(function(resolve) {
        window.onYouTubeIframeAPIReady = resolve;
    });

    fastdom.write(function () {
        loadScript({ id: scriptId, src: scriptSrc });
    }, this);

    return {
        init: function() {
            return {
                promise: promise
            };
        }
    };
});
