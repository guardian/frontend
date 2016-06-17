/**
 Hosted video
 */

define([
    'bean',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/defer-to-analytics',
    'common/modules/video/events',
    'common/modules/video/videojs-options',
    'common/modules/video/fullscreener',
    'lodash/collections/contains',
    'text!common/views/ui/loading.html'
], function (
    bean,
    $,
    detect,
    deferToAnalytics,
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
        setInterval(function () {
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
                    var duration = parseInt(this.duration(), 10);
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

                    if (contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint())) {
                        player.on('timeupdate', function() {
                            var currentTime = parseInt(this.currentTime(), 10);
                            var time = 10; //seconds before the end when to show the timer

                            if (duration - currentTime <= time) {
                                player.off('timeupdate');
                                var $hostedNext = $('.js-hosted-next-autoplay');
                                var $timer = $('.js-autoplay-timer');
                                var nextVideoPage;

                                if ($timer.length) {
                                    nextVideoPage = $timer.data('next-page');
                                    nextVideoTimer(time, $timer, nextVideoPage);
                                    $hostedNext.addClass('js-autoplay-start');
                                }
                            }
                        });
                    }
                });
            });
        });
    }

    return {
        init: init
    };
});
