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
    loadingTmpl
) {
    var player;

    function isDesktop() {
        return detect.isBreakpoint({ min: 'desktop' });
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

    function setupVideo(video, videojs) {
        var mediaId = video.getAttribute('data-media-id');
        player = videojs(video, videojsOptions());
        player.guMediaType = 'video';
        videojs.plugin('fullscreener', fullscreener);

        events.addContentEvents(player, mediaId, player.guMediaType);
        events.bindGoogleAnalyticsEvents(player, window.location.pathname);

        player.ready(function () {
            onPlayerReady(this, mediaId);
        });

        nextVideoAutoplay.init().then(function(){
            if (nextVideoAutoplay.canAutoplay()) {
                //on desktop show the next video link 10 second before the end of the currently watching video
                if (isDesktop()) {
                    nextVideoAutoplay.addCancelListener();
                    player && player.one('timeupdate', nextVideoAutoplay.triggerAutoplay.bind(this, player.currentTime.bind(player), parseInt(video.getAttribute('data-duration'), 10)));
                } else {
                    player && player.one('ended', nextVideoAutoplay.triggerEndSlate);
                }
            }
        });
    }

    function onPlayerReady(player, mediaId) {
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

        deferToAnalytics(function () {
            events.initOphanTracking(player, mediaId);
            events.bindGlobalEvents(player);
            events.bindContentEvents(player);
        });

        player.on('error', onPlayerError);
    }

    function onPlayerError() {
        var player = this;
        var err = player.error();
        if (err && 'message' in err && 'code' in err) {
            reportError(new Error(err.message), {
                feature: 'hosted-player',
                vjsCode: err.code
            }, false);
        }
    }

    function init(moduleName) {
        var $videoEl = $('.vjs-hosted__video, video');
        var $youtubeIframe = $('.js-hosted-youtube-video');

        if ($youtubeIframe.length === 0 && $videoEl.length === 0) {
            // halt execution
            return Promise.resolve();
        }

        performanceLogging.moduleStart(moduleName);

        // Return a promise that resolves after the async work is done.
        Promise.resolve(require(['bootstraps/enhanced/media/main']))
        .then(function () {
            return require(['bootstraps/enhanced/media/video-player']);
        })
        .then(function (videojs) {
            $videoEl.each(function(el){
                setupVideo(el, videojs);
            });

            $youtubeIframe.each(hostedYoutube.init);
        })
        .then(moduleEnd, moduleEnd);

        function moduleEnd(){
            performanceLogging.moduleEnd(moduleName);
        }

        return Promise.resolve();
    }

    return {
        init: init
    };
});
