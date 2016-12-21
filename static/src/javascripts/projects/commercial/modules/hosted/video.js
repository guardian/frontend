/**
 Hosted video
 */

define([
    'Promise',
    'commercial/modules/hosted/youtube',
    'commercial/modules/hosted/next-video-autoplay',
    'commercial/modules/dfp/performance-logging',
    'common/utils/$',
    'common/utils/defer-to-analytics',
    'common/utils/detect',
    'common/utils/report-error',
    'common/modules/video/events',
    'common/modules/video/videojs-options',
    'common/modules/media/videojs-plugins/fullscreener',
    'lodash/collections/contains',
    'text!common/views/ui/loading.html'
], function (
    Promise,
    hostedYoutube,
    nextVideoAutoplay,
    performanceLogging,
    $,
    deferToAnalytics,
    detect,
    reportError,
    events,
    videojsOptions,
    fullscreener,
    contains,
    loadingTmpl
) {
    var player;

    function isDesktop() {
        return contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint());
    }

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

    function init(moduleName) {
        performanceLogging.moduleStart(moduleName);

        // Return a promise that resolves after the async work is done.
        var enhanceVideo = new Promise(function(resolve){

            var $videoEl = $('.vjs-hosted__video, video');
            var $youtubeIframe = $('.js-hosted-youtube-video');

            if ($youtubeIframe.length === 0 && $videoEl.length === 0) {
                // halt execution
                performanceLogging.moduleEnd(moduleName);
                resolve();
                return;
            }

            require(['bootstraps/enhanced/media/main'], function() {
                require(['bootstraps/enhanced/media/video-player'], function (videojs) {

                    $videoEl.each(function(el){
                        var mediaId = $videoEl.attr('data-media-id');
                        player = videojs(el, videojsOptions());
                        player.guMediaType = 'video';
                        videojs.plugin('fullscreener', fullscreener);

                        events.addContentEvents(player, mediaId, player.guMediaType);
                        events.bindGoogleAnalyticsEvents(player, window.location.pathname);

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

                            deferToAnalytics(function () {
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

                        nextVideoAutoplay.init().then(function(){
                            if (nextVideoAutoplay.canAutoplay()) {
                                //on desktop show the next video link 10 second before the end of the currently watching video
                                if (isDesktop()) {
                                    nextVideoAutoplay.addCancelListener();
                                    player && player.one('timeupdate', nextVideoAutoplay.triggerAutoplay.bind(this, player.currentTime.bind(player), parseInt($videoEl.data('duration'), 10)));
                                } else {
                                    player && player.one('ended', nextVideoAutoplay.triggerEndSlate);
                                }
                            }
                        });
                    });

                    $youtubeIframe.each(function(el){
                        hostedYoutube.init(el);
                    });

                    performanceLogging.moduleEnd(moduleName);
                    resolve();
                });
            });
        });

        return enhanceVideo;
    }

    return {
        init: init,
        customTiming: true
    };
});
