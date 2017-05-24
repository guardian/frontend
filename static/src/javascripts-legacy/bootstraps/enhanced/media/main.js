define([
    'bean',
    'bonzo',
    'fastdom',
    'lib/fastdom-promise',
    'lib/raven',
    'lib/$',
    'lib/config',
    'lib/defer-to-analytics',
    'lib/detect',
    'lib/mediator',
    'common/modules/commercial/video-ad-url',
    'commercial/modules/commercial-features',
    'common/modules/component',
    'common/modules/experiments/ab',
    'common/modules/video/events',
    'common/modules/video/metadata',
    'common/modules/media/videojs-plugins/fullscreener',
    'common/modules/media/videojs-plugins/skip-ad',
    'common/modules/video/video-container',
    'common/modules/video/onward-container',
    'common/modules/video/more-in-series-container',
    'common/modules/video/videojs-options',
    'bootstraps/enhanced/media/video-player',
    'raw-loader!common/views/ui/loading.html',
    'commercial/modules/user-features',
    'lib/load-script'
], function (
    bean,
    bonzo,
    fastdom,
    fastdomPromise,
    raven,
    $,
    config,
    deferToAnalytics,
    detect,
    mediator,
    videoAdUrl,
    commercialFeatures,
    Component,
    ab,
    events,
    videoMetadata,
    fullscreener,
    skipAd,
    videoContainer,
    onwardContainer,
    moreInSeriesContainer,
    videojsOptions,
    videojs,
    loadingTmpl,
    userFeatures,
    loadScript
) {
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

    function createVideoPlayer(el, options) {
        var player = videojs(el, options);

        var duration = parseInt(el.getAttribute('data-duration'), 10);

        player.ready(function () {
            if (!isNaN(duration)) {
                player.duration(duration);
                player.trigger('timeupdate'); // triggers a refresh of relevant control bar components
            }
            // we have some special autoplay rules, so do not want to depend on 'default' autoplay
            player.guAutoplay = $(el).attr('data-auto-play') === 'true';

            // need to explicitly set the dimensions for the ima plugin.
            player.height(bonzo(player.el()).parent().dim().height);
            player.width(bonzo(player.el()).parent().dim().width);
        });

        return player;
    }

    function initPlayButtons(root) {
        fastdom.read(function () {
            $('.js-video-play-button', root).each(function (el) {
                var $el = bonzo(el);
                bean.on(el, 'click', function () {
                    var placeholder, player, container;
                    container = bonzo(el).parent().parent();
                    placeholder = $('.js-video-placeholder', container);
                    player = $('.js-video-player', container);
                    fastdom.write(function () {
                        placeholder.removeClass('media__placeholder--active').addClass('media__placeholder--hidden');
                        player.removeClass('media__container--hidden').addClass('media__container--active');
                        $el.removeClass('media__placeholder--active').addClass('media__placeholder--hidden');
                        enhanceVideo($('video', player).get(0), true);
                    });
                });
                fastdom.write(function () {
                    $el.removeClass('media__placeholder--hidden').addClass('media__placeholder--active');
                });
            });
        });
    }

    function initPlayer(withPreroll) {
        videojs.plugin('skipAd', skipAd);
        videojs.plugin('fullscreener', fullscreener);

        fastdom.read(function () {
            $('.js-gu-media--enhance').each(function (el) {
                enhanceVideo(el, false, withPreroll);
            });
        });
    }

    function initExploreVideo(){
        var player = $('.vjs-tech'),
            headline = $('.explore-series-headline')[0],
            controls = $('.vjs-control-bar');
        if(player && headline && controls){
            bean.on(player[0], 'playing', function () {
                bonzo(headline).addClass('playing');
                bonzo(controls[0]).addClass('playing');
            });
            bean.on(player[0], 'pause', function () {
              bonzo(headline).removeClass('playing');
              bonzo(controls[0]).removeClass('playing');
            });
        }
    }

    function enhanceVideo(el, autoplay, shouldPreroll) {
        var mediaType = el.tagName.toLowerCase(),
            $el = bonzo(el).addClass('vjs'),
            mediaId = $el.attr('data-media-id'),
            endSlateUri = $el.attr('data-end-slate'),
            embedPath = $el.attr('data-embed-path'),
            // we need to look up the embedPath for main media videos
            canonicalUrl = $el.attr('data-canonical-url') || (embedPath ? embedPath : null),
            // the fallback to window.location.pathname should only happen for main media on fronts
            gaEventLabel = canonicalUrl || window.location.pathname,
            player,
            mouseMoveIdle,
            playerSetupComplete,
            withPreroll,
            blockVideoAds;

        //end-slate url follows the patten /video/end-slate/section/<section>.json?shortUrl=
        //only show end-slate if page has a section i.e. not on the `/global` path
        //e.g https://www.theguardian.com/global/video/2016/nov/01/what-happened-at-the-battle-of-orgreave-video-explainer
        var showEndSlate = $el.attr('data-show-end-slate') === 'true' && !!config.page.section;

        player = createVideoPlayer(el, videojsOptions({
            plugins: {
                embed: {
                    embeddable: !config.page.isFront && config.switches.externalVideoEmbeds && (config.page.contentType === 'Video' || $el.attr('data-embeddable') === 'true'),
                    location: config.page.externalEmbedHost + '/embed/video/' + (embedPath ? embedPath : config.page.pageId)
                }
            }
        }));

        events.addContentEvents(player, mediaId, mediaType);
        events.addPrerollEvents(player, mediaId, mediaType);
        events.bindGoogleAnalyticsEvents(player, gaEventLabel);

        videoMetadata.getVideoInfo($el).then(function(videoInfo) {
            if (videoInfo.expired) {
                player.ready(function() {
                    player.error({
                        code: 0,
                        type: 'Video Expired',
                        message: 'This video has been removed. This could be because it launched early, ' +
                                 'our rights have expired, there was a legal issue, or for another reason.'
                    });
                    player.bigPlayButton.dispose();
                    player.errorDisplay.open();
                    player.controlBar.dispose();
                });
            } else {
                videoMetadata.isGeoBlocked(el).then(function (isVideoGeoBlocked) {
                    if (isVideoGeoBlocked) {
                        player.ready(function() {
                            player.error({
                                code: 0,
                                type: 'Video Unavailable',
                                message: 'Sorry, this video is not available in your region due to rights restrictions.'
                            });
                            player.bigPlayButton.dispose();
                            player.errorDisplay.open();
                            player.controlBar.dispose();
                        });
                    } else {
                        blockVideoAds = videoInfo.shouldHideAdverts || (config.switches.adFreeMembershipTrial && userFeatures.isAdFreeUser());

                        withPreroll = shouldPreroll && !blockVideoAds;

                        // Location of this is important.
                        events.bindErrorHandler(player);
                        player.guMediaType = mediaType;

                        playerSetupComplete = new Promise(function (resolve) {
                            player.ready(function () {
                                var vol;

                                deferToAnalytics(function () {
                                    events.initOphanTracking(player, mediaId);
                                    events.bindGlobalEvents(player);
                                    events.bindContentEvents(player);
                                    if (withPreroll) {
                                        events.bindPrerollEvents(player);
                                    }
                                });

                                initLoadingSpinner(player);
                                upgradeVideoPlayerAccessibility(player);

                                // unglitching the volume on first load
                                vol = player.volume();
                                if (vol) {
                                    player.volume(0);
                                    player.volume(vol);
                                }

                                player.persistvolume({namespace: 'gu.vjs'});

                                // preroll for videos only
                                if (mediaType === 'video') {
                                    player.fullscreener();

                                    if (showEndSlate && detect.isBreakpoint({ min: 'desktop' })) {
                                        initEndSlate(player, endSlateUri);
                                    }

                                    if (withPreroll) {
                                        raven.wrap({ tags: { feature: 'media' } }, function () {
                                            player.ima({
                                                id: mediaId,
                                                adTagUrl: videoAdUrl.get(),
                                                prerollTimeout: 1000,
                                                // We set this sightly higher so contrib-ads never timeouts before ima.
                                                contribAdsSettings: {
                                                    timeout: 2000
                                                }
                                            });
                                            player.on('adstart', function() {
                                                player.skipAd(mediaType, 15);
                                            });
                                            player.ima.requestAds();

                                            // Video analytics event.
                                            player.trigger(events.constructEventName('preroll:request', player));
                                            resolve();
                                        })();
                                    } else {
                                        resolve();
                                    }
                                } else {
                                    player.playlist({
                                        mediaType: 'audio',
                                        continuous: false
                                    });
                                    resolve();
                                }

                                // built in vjs-user-active is buggy so using custom implementation
                                player.on('mousemove', function () {
                                    clearTimeout(mouseMoveIdle);
                                    fastdom.write(function () {
                                        player.addClass('vjs-mousemoved');
                                    });

                                    mouseMoveIdle = setTimeout(function () {
                                        fastdom.write(function () {
                                            player.removeClass('vjs-mousemoved');
                                        });
                                    }, 500);
                                });

                            });
                        });

                        playerSetupComplete.then(function () {
                            if (autoplay) {
                                player.play();
                            }
                        });
                    }
                });
            }
        });
        if($('.explore--video').length > 0){
          initExploreVideo();
        }
        return player;
    }

    function initEndSlate(player, endSlatePath) {
        var endSlate = new Component(),
            endStateClass = 'vjs-has-ended';

        endSlate.endpoint = endSlatePath;

        player.one(events.constructEventName('content:play', player), function () {
            endSlate.fetch(player.el(), 'html');

            player.on('ended', function () {
                bonzo(player.el()).addClass(endStateClass);
            });
        });

        player.on('playing', function () {
            bonzo(player.el()).removeClass(endStateClass);
        });
    }

    function getMediaType() {
        return config.page.contentType.toLowerCase();
    }

    function initMoreInSection() {
        if (!config.isMedia || !config.page.showRelatedContent || !config.page.section) {
            return;
        }

        var el  = $('.js-more-in-section')[0];
        moreInSeriesContainer.init(
            el, getMediaType(),
            config.page.section,
            config.page.shortUrl,
            config.page.seriesId
        );
    }

    function initOnwardContainer() {
        if (!config.isMedia) {
            return;
        }

        var mediaType = getMediaType();
        var els = $(mediaType === 'video' ? '.js-video-components-container' : '.js-media-popular');

        els.each(function(el) {
            onwardContainer.init(el, mediaType);
        });
    }

    function initWithRaven(withPreroll) {
        raven.wrap(
            { tags: { feature: 'media' } },
            function () { initPlayer(withPreroll); }
        )();
    }

    function initFacia() {
        if (config.page.isFront) {
            $('.js-video-playlist').each(function(el) {
                videoContainer.init(el);
            });
        }
    }

    function init() {
        // The `hasMultipleVideosInPage` flag is temporary until the # will be fixed
        var shouldPreroll = commercialFeatures.commercialFeatures.videoPreRolls &&
            !config.page.hasMultipleVideosInPage &&
            !config.page.hasYouTubeAtom &&
            !config.page.isFront &&
            !config.page.isPaidContent &&
            !config.page.sponsorshipType;

        if (config.switches.enhancedMediaPlayer) {
            if (shouldPreroll) {
                loadScript.loadScript('//imasdk.googleapis.com/js/sdkloader/ima3.js').then(function () {
                    initWithRaven(true);
                }).catch(function (e) {
                    raven.captureException(e, { tags: { feature: 'media', action: 'ads', ignored: true } });
                    initWithRaven();
                })
            } else {
                initWithRaven();
            }
        }

        // Setup play buttons
        initPlayButtons(document.body);
        mediator.on('modules:related:loaded', initPlayButtons);
        mediator.on('page:media:moreinloaded', initPlayButtons);

        initFacia();

        initMoreInSection();

        initOnwardContainer();
    }

    return {
        init: init
    };
});
