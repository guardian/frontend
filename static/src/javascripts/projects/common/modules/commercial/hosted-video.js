/**
 Hosted video
 */

define([
    'bean',
    'common/utils/$',
    'common/utils/defer-to-analytics',
    'common/modules/video/events',
    'common/modules/video/videojs-options',
    'common/modules/video/fullscreener',
    'text!common/views/ui/loading.html'
], function (
    bean,
    $,
    deferToAnalytics,
    events,
    videojsOptions,
    fullscreener,
    loadingTmpl
) {
    var player;
    var nextVideoInterval;

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

    function nextVideoTimer(duration, $timer, nextVideoLink) {
        return setInterval(function () {
            duration = parseInt(duration % 60, 10); //make sure we have seconds
            if (duration === 0) {
                window.location = nextVideoLink;
            }
            $timer.text(duration + 's');
            duration = duration - 1;
        }, 1000);
    }

    function init() {
        require(['bootstraps/enhanced/media/main'], function () {
            require(['bootstraps/enhanced/media/video-player'], function(videojs){
                var $videoEl = $('.vjs-hosted__video');

                if (!$videoEl.length) {
                    return;
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

                    player.one('ended', function() {
                        var $timer = $('.js-autoplay-timer');
                        var time = 10; //duration in seconds
                        var nextVideoPage;

                        if ($timer.length) {
                            nextVideoPage = $timer.data('next-page');
                            nextVideoInterval = nextVideoTimer(time, $timer, nextVideoPage);
                        }
                    });

                    bean.on($('.vjs-fullscreen-clickbox')[0], 'click', function() {
                        console.log(nextVideoInterval);
                        clearInterval(nextVideoInterval);
                    });
                });
            });
        });
    }

    return {
        init: init
    };
});
