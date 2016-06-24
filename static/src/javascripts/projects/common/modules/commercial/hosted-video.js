/**
 Hosted video
 */

define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/defer-to-analytics',
    'common/modules/analytics/omniture',
    'common/modules/experiments/ab',
    'common/modules/video/events',
    'common/modules/video/videojs-options',
    'common/modules/video/fullscreener',
    'lodash/collections/contains',
    'text!common/views/ui/loading.html'
], function (
    bean,
    fastdom,
    $,
    detect,
    deferToAnalytics,
    omniture,
    ab,
    events,
    videojsOptions,
    fullscreener,
    contains,
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
            if (duration === 0) {
                omniture.trackLinkImmediate('autoplay the next video');
                window.location = nextVideoLink;
            }
            fastdom.write(function () {
                $timer.text(duration + 's');
                duration = duration - 1;
            });
        }, 1000);
    }

    function cancelAutoplay($hostedNext) {
        fastdom.write(function () {
            $hostedNext.addClass('u-h');
        });
        clearInterval(nextVideoInterval);
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
                    var $hostedNext = $('.js-hosted-next-autoplay');
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

                    if (contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint()) && $hostedNext.length && ab.getParticipations().HostedAutoplay
                        && (ab.getParticipations().HostedAutoplay.variant === 'variant1' || ab.getParticipations().HostedAutoplay.variant === 'variant2')) {
                        if (ab.getParticipations().HostedAutoplay.variant === 'variant2') {
                            fastdom.write(function () {
                                $hostedNext.addClass('hosted-next-autoplay--variant2');
                            });
                        }
                        fastdom.write(function () {
                            $('.js-hosted-fading').addClass('hosted-autoplay-ab');
                        });

                        player.on('timeupdate', function() {
                            var currentTime = parseInt(this.currentTime(), 10);
                            var time = 10; //seconds before the end when to show the timer

                            if (duration - currentTime <= time) {
                                player.off('timeupdate');

                                var $timer = $('.js-autoplay-timer');
                                var nextVideoPage;

                                if ($timer.length) {
                                    nextVideoPage = $timer.data('next-page');
                                    nextVideoInterval = nextVideoTimer(time, $timer, nextVideoPage);
                                    fastdom.write(function () {
                                        $hostedNext.addClass('js-autoplay-start');
                                    });
                                    bean.on(document, 'click', $('.js-autoplay-cancel'), function() {
                                        cancelAutoplay($hostedNext);
                                    });
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
