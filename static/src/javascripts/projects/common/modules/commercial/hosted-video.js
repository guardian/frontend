/**
 Hosted video
 */

define([
    'bean',
    'common/utils/$',
    'common/utils/defer-to-analytics',
    'common/modules/video/events',
    'common/modules/video/supportedBrowsers',
    'bootstraps/enhanced/media/video-player',
    'text!common/views/ui/loading.html'
], function (
    bean,
    $,
    deferToAnalytics,
    events,
    supportedBrowsers,
    videojs,
    loadingTmpl
) {
    var player;

    function initLoadingSpinner(player) {
        player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
    }

    function upgradeVideoPlayerAccessibility(player) {
        // Set the video tech element to aria-hidden, and label the buttons in the videojs control bar.
        // It doesn't matter what kind of tech this is, flash or html5.
        $('.vjs-tech', player.el()).attr('aria-hidden', true);

        // Hide superfluous controls, and label useful buttons.
        $('.vjs-big-play-button', player.el()).attr('aria-hidden', true);
        $('.vjs-current-time', player.el()).attr('aria-hidden', true);
        $('.vjs-time-divider', player.el()).attr('aria-hidden', true);
        $('.vjs-duration', player.el()).attr('aria-hidden', true);
        $('.vjs-embed-button', player.el()).attr('aria-hidden', true);

        $('.vjs-play-control', player.el()).attr('aria-label', 'video play');
        $('.vjs-mute-control', player.el()).attr('aria-label', 'video mute');
        $('.vjs-fullscreen-control', player.el()).attr('aria-label', 'video fullscreen');
    }

    function init() {
        var $videoEl = $('.vjs-hosted__video');

        if (!$videoEl.length) {
            return;
        }

        var mediaId = $videoEl.attr('data-media-id');

        player = videojs($videoEl.get(0), {
            controls: true,
            autoplay: false,
            preload: 'metadata'
        });

        player.ready(function () {
            deferToAnalytics(function () {
                events.initOmnitureTracking(player);
                events.initOphanTracking(player, mediaId);

                events.bindGlobalEvents(player);
                events.bindContentEvents(player);
            });

            initLoadingSpinner(player);
            upgradeVideoPlayerAccessibility(player);
            supportedBrowsers(player);
        });
    }

    return {
        init: init
    };
});
