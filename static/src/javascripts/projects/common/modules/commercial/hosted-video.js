/**
 Hosted video
 */

define([
    'Promise',
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/defer-to-analytics',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/report-error',
    'common/modules/analytics/omniture',
    'common/modules/experiments/ab',
    'common/modules/video/events',
    'common/modules/video/videojs-options',
    'common/modules/media/videojs-plugins/fullscreener',
    'lodash/collections/contains',
    'text!common/views/ui/loading.html'
], function (
    Promise,
    bean,
    fastdom,
    $,
    deferToAnalytics,
    detect,
    mediator,
    reportError,
    omniture,
    ab,
    events,
    videojsOptions,
    fullscreener,
    contains,
    loadingTmpl
) {
    var player;

    function initLoadingSpinner(player) {
        player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
    }

    function upgradeVideoPlayerAccessibility(player) {
        // Set the video tech element to aria-hidden, and label the buttons in the videojs control bar.
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
        return new Promise(function (resolve) {
            require(['bootstraps/enhanced/media/main'], function () {
                require(['bootstraps/enhanced/media/video-player'], function (videojs) {
                    var $videoEl = $('.vjs-hosted__video');

                    if ($videoEl.length === 0) {
                        // halt execution
                        return resolve();
                    }

                    player = videojs($videoEl.get(0), videojsOptions());
                    player.guMediaType = 'video';
                    videojs.plugin('fullscreener', fullscreener);

                    player.ready(function () {
                        var vol;
                        initLoadingSpinner(player);
                        upgradeVideoPlayerAccessibility(player);

                        // unglitching the volume on first load
                        vol = player.volume();
                        if (vol) {
                            player.volume(0);
                            player.volume(vol);
                        }

                        player.fullscreener();

                        var mediaId = $videoEl.attr('data-media-id');
                        deferToAnalytics(function () {
                            events.initOmnitureTracking(player);
                            events.initOphanTracking(player, mediaId);

                            events.bindGlobalEvents(player);
                            events.bindContentEvents(player);
                        });

                        player.on('error', function () {
                            var err = player.error();
                            if (err && 'message' in err && 'code' in err) {
                                reportError(new Error(err.message), {
                                    feature: 'hosted-player',
                                    vjsCode: err.code
                                }, false);
                            }
                        });
                    });

                    resolve();
                });
            });
        });
    }

    return {
        init: init
    };
});
