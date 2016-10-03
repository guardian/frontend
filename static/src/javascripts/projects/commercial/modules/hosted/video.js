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
    'common/modules/video/youtube-player',
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
    youtubePlayer,
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
                    var $inlineVideoEl = $('video');
                    var $hostedNext = $('.js-hosted-next-autoplay');
                    var $youtubeIframe = $('.js-hosted-youtube-video');
                    var $timer = $('.js-autoplay-timer');
                    var nextVideoPage = $timer.length && $timer.data('next-page');
                    var duration;
                    function useAutoplay(){
                        return contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint());
                    }

                    if ($youtubeIframe.length === 0 && $videoEl.length === 0) {
                        if ($inlineVideoEl.length === 0) {
                            // halt execution
                            return resolve();
                        } else {
                            $videoEl = $inlineVideoEl;
                        }
                    }

                    $videoEl.each(function(el){
                        player = videojs(el, videojsOptions());
                        player.guMediaType = 'video';
                        videojs.plugin('fullscreener', fullscreener);

                        player.ready(function () {
                            var vol;
                            var player = this;
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

                    });
                    if ($hostedNext.length && nextVideoPage) {
                        //on desktop show the next video link 10 second before the end of the currently watching video
                        if (useAutoplay()) {
                            bean.on(document, 'click', $('.js-autoplay-cancel'), function () {
                                cancelAutoplay($hostedNext);
                            });
                            player && player.one('timeupdate', triggerAutoplay.bind(this, player.currentTime.bind(player), parseInt(player.duration(), 10)));
                        } else {
                            player && player.one('ended', triggerEndSlate);
                        }
                    }

                    $youtubeIframe.each(function(el){
                        duration = $(el).data('duration');
                        var $currentTime = $('.js-youtube-current-time');
                        youtubePlayer.init(el, {
                            onPlayerStateChange: function (event) {
                                if(event.data == window.YT.PlayerState.ENDED) {
                                    $currentTime.text('0:00');
                                    if(nextVideoPage && !useAutoplay()){
                                        triggerEndSlate();
                                    }
                                } else {
                                    var currentTime = Math.floor(event.target.getCurrentTime());
                                    var seconds = currentTime % 60;
                                    var minutes = (currentTime - seconds) / 60;
                                    $currentTime.text(minutes + (seconds < 10 ? ':0' : ':') + seconds);
                                }
                            },
                            onPlayerReady: function (event) {
                                if (nextVideoPage && useAutoplay()) {
                                    triggerAutoplay(event.target.getCurrentTime.bind(event.target), duration);
                                }
                            }
                        });
                    });

                    function triggerAutoplay(getCurrentTimeFn, duration) {
                        nextVideoInterval = setInterval(function () {
                            var timeLeft = duration - Math.floor(getCurrentTimeFn());
                            var countdownLength = 10; //seconds before the end when to show the timer

                            if (timeLeft <= countdownLength) {
                                fastdom.write(function () {
                                    $hostedNext.addClass('js-autoplay-start');
                                    $timer.text(timeLeft + 's');
                                });
                            }
                            if(timeLeft <= 0){
                                omniture.trackLinkImmediate('Immediately play the next video');
                                window.location = nextVideoPage;
                            }
                        }, 1000);
                    }
                    function triggerEndSlate() {
                        fastdom.write(function () {
                            $hostedNext.addClass('js-autoplay-start');
                        });
                        bean.on(document, 'click', $('.js-autoplay-cancel'), function () {
                            cancelAutoplayMobile($hostedNext);
                        });
                    }
                    resolve();
                });
            });
        });
    }

    return {
        init: init
    };
});
