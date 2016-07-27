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
    var nextVideoInterval;

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

    function nextVideoTimer(duration, $timer, nextVideoLink) {
        return setInterval(function () {
            if (duration === 0) {
                omniture.trackLinkImmediate('Immediately play the next video');
                mediator.emit('hosted video: autoredirect');//inform AB framework about the success
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
            $hostedNext.addClass('hosted-slide-out');
        });
        clearInterval(nextVideoInterval);
    }

    function cancelAutoplayMobile($hostedNext) {
        fastdom.write(function () {
            $hostedNext.addClass('u-h');
        });
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

                        player.on('error', function () {
                            var err = player.error();
                            if (err && 'message' in err && 'code' in err) {
                                reportError(new Error(err.message), {
                                    feature: 'hosted-player',
                                    vjsCode: err.code
                                }, false);
                            }
                        });

                        if ($hostedNext.length && ab.getParticipations().HostedAutoplay
                            && (ab.getParticipations().HostedAutoplay.variant === 'variant1' || ab.getParticipations().HostedAutoplay.variant === 'variant2')) {
                            if (ab.getParticipations().HostedAutoplay.variant === 'variant2') {
                                fastdom.write(function () {
                                    $hostedNext.addClass('hosted-next-autoplay--variant2');
                                });
                            }
                            fastdom.write(function () {
                                $('.js-hosted-fading').addClass('hosted-autoplay-ab');
                            });

                            //on desktop show the next video link 10 second before the end of the currently watching video
                            if (contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint())) {
                                player.on('timeupdate', function () {
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
                                            bean.on(document, 'click', $('.js-autoplay-cancel'), function () {
                                                cancelAutoplay($hostedNext);
                                            });
                                        }
                                    }
                                });
                            } else {
                                player.one('ended', function () {
                                    fastdom.write(function () {
                                        $hostedNext.addClass('js-autoplay-start');
                                    });
                                    bean.on(document, 'click', $('.js-autoplay-cancel'), function () {
                                        cancelAutoplayMobile($hostedNext);
                                    });
                                });
                            }
                        }
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
