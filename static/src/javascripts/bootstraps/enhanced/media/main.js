define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/fastdom-promise',
    'raven',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/defer-to-analytics',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/url',
    'common/utils/ajax',
    'common/modules/analytics/beacon',
    'common/modules/commercial/build-page-targeting',
    'common/modules/commercial/commercial-features',
    'common/modules/component',
    'common/modules/experiments/ab',
    'common/modules/video/events',
    'common/modules/video/fullscreener',
    'common/modules/video/tech-order',
    'common/modules/video/video-container',
    'common/modules/video/onward-container',
    'common/modules/video/more-in-series-container',
    'common/modules/video/videojs-options',
    // This must be the full path because we use curl config to change it based
    // on env
    'bootstraps/enhanced/media/video-player',
    'text!common/views/ui/loading.html'
], function (
    bean,
    bonzo,
    fastdom,
    fastdomPromise,
    raven,
    Promise,
    $,
    config,
    deferToAnalytics,
    detect,
    mediator,
    urlUtils,
    ajax,
    beacon,
    buildPageTargeting,
    commercialFeatures,
    Component,
    ab,
    events,
    fullscreener,
    techOrder,
    videoContainer,
    onwardContainer,
    moreInSeriesContainer,
    videojsOptions,
    videojs,
    loadingTmpl
) {
    function getAdUrl() {
        var queryParams = {
            ad_rule:                 1,
            correlator:              new Date().getTime(),
            cust_params:             encodeURIComponent(urlUtils.constructQuery(buildPageTargeting())),
            env:                     'vp',
            gdfp_req:                1,
            impl:                    's',
            iu:                      config.page.adUnit,
            output:                  'xml_vast2',
            scp:                     encodeURIComponent('slot=video'),
            sz:                      '400x300',
            unviewed_position_start: 1
        };

        return 'https://' + config.page.dfpHost + '/gampad/ads?' + urlUtils.constructQuery(queryParams);
    }

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

    function createVideoPlayer(el, options) {

        var player = videojs(el, options),
            $el = $(el),
            duration = parseInt($el.attr('data-duration'), 10);

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

            if (events.handleInitialMediaError(player)) {
                player.dispose();
                options.techOrder = techOrder(el).reverse();
                player = videojs(el, options);
            }
        });

        return player;
    }

    // Apologies for the slightly hacky nature of this.
    // Improvements welcomed...
    function isFlash(event) {
        return event.target.firstChild &&
            event.target.firstChild.id &&
            event.target.firstChild.id.indexOf('flash_api') > 0;
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
        // When possible, use our CDN instead of a third party (zencoder).
        if (config.page.videoJsFlashSwf) {
            videojs.options.flash.swf = config.page.videoJsFlashSwf;
        }
        videojs.plugin('adSkipCountdown', events.adSkipCountdown);
        videojs.plugin('fullscreener', fullscreener);

        fastdom.read(function () {
            $('.js-gu-media--enhance').each(function (el) {
                enhanceVideo(el, false, withPreroll);
            });
        });

        initPlayButtons(document.body);

        mediator.on('modules:related:loaded', initPlayButtons);
        mediator.on('page:media:moreinloaded', initPlayButtons);
    }

    function enhanceVideo(el, autoplay, shouldPreroll) {
        var mediaType = el.tagName.toLowerCase(),
            $el = bonzo(el).addClass('vjs vjs-tech-' + videojs.options.techOrder[0]),
            mediaId = $el.attr('data-media-id'),
            showEndSlate = $el.attr('data-show-end-slate') === 'true',
            endSlateUri = $el.attr('data-end-slate'),
            embedPath = $el.attr('data-embed-path'),
            // we need to look up the embedPath for main media videos
            canonicalUrl = $el.attr('data-canonical-url') || (embedPath ? '/' + embedPath : null),
            shouldHideAdverts = $el.attr('data-block-video-ads') === 'false' ? false : true,
            techPriority = techOrder(el),
            player,
            mouseMoveIdle,
            playerSetupComplete,
            withPreroll,
            blockVideoAds;

        var videoInfo = new Promise(function(resolve) {
            // We only have the canonical URL in videos embedded in articles / main media.
            // These are set to the safest defaults that will always play video.
            var defaultVideoInfo = {
                expired: false,
                shouldHideAdverts: shouldHideAdverts
            };

            if (!canonicalUrl) {
                resolve(defaultVideoInfo);
            } else {
                var ajaxInfoUrl = config.page.ajaxUrl + urlUtils.getPath(canonicalUrl);

                ajax({
                    url: ajaxInfoUrl + '/info.json',
                    type: 'json',
                    crossOrigin: true
                }).then(function(videoInfo) {
                    resolve(videoInfo);
                }, function() {
                    // if this fails, don't stop, keep going.
                    resolve(defaultVideoInfo);
                });
            }
        });

        player = createVideoPlayer(el, videojsOptions({
            techOrder: techPriority,
            plugins: {
                embed: {
                    embeddable: !config.page.isFront && config.switches.externalVideoEmbeds && (config.page.contentType === 'Video' || $el.attr('data-embeddable') === 'true'),
                    location: config.page.externalEmbedHost + '/embed/video/' + (embedPath ? embedPath : config.page.pageId)
                }
            }
        }));

        videoInfo.then(function(videoInfo) {
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
                });
            } else {
                blockVideoAds = videoInfo.shouldHideAdverts;
                withPreroll = shouldPreroll && !blockVideoAds;

                // Location of this is important.
                events.bindErrorHandler(player);
                player.guMediaType = mediaType;

                playerSetupComplete = new Promise(function (resolve) {
                    player.ready(function () {
                        var vol;

                        deferToAnalytics(function () {
                            events.initOmnitureTracking(player, mediaId);
                            events.initOphanTracking(player, mediaId);

                            events.bindGlobalEvents(player);
                            events.bindContentEvents(player);
                            if (withPreroll) {
                                events.bindPrerollEvents(player);
                            }
                        });

                        initLoadingSpinner(player);
                        upgradeVideoPlayerAccessibility(player);

                        player.one('playing', function (e) {
                            if (isFlash(e)) {
                                beacon.counts('video-tech-flash');
                            } else {
                                beacon.counts('video-tech-html5');
                            }
                        });

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
                                raven.wrap(
                                    { tags: { feature: 'media' } },
                                    function () {
                                        player.ima({
                                            id: mediaId,
                                            adTagUrl: getAdUrl(),
                                            prerollTimeout: 1000,
                                            // We set this sightly higher so contrib-ads never timeouts before ima.
                                            contribAdsSettings: {
                                                timeout: 1200
                                            }
                                        });
                                        player.on('adstart', function() {
                                            player.adSkipCountdown(15);
                                        });
                                        player.ima.requestAds();

                                        // Video analytics event.
                                        player.trigger(events.constructEventName('preroll:request', player));
                                        resolve();
                                    }
                                )();
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

        return player;
    }

    function initEndSlate(player, endSlatePath) {
        var endSlate = new Component(),
            endState = 'vjs-has-ended';

        endSlate.endpoint = endSlatePath;
        endSlate.fetch(player.el(), 'html');

        player.one(events.constructEventName('content:play', player), function () {
            player.on('ended', function () {
                bonzo(player.el()).addClass(endState);
            });
        });
        player.on('playing', function () {
            bonzo(player.el()).removeClass(endState);
        });
    }

    function getMediaType() {
        return config.page.contentType.toLowerCase();
    }

    function initMoreInSection() {
        if (!config.isMedia || !config.page.showRelatedContent) {
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
        var el = $(mediaType === 'video' ? '.js-video-components-container' : '.js-media-popular')[0];
        onwardContainer.init(el, mediaType);
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

    function initYellowPlayButton() {
        var selector = '.fc-item__video';
        var hoverStateClassName = 'u-faux-block-link--hover';

        $(selector).each(function (el) {
            bonzo(el).parent().addClass('vjs-big-play-button--yellow');
        });

        var showIntentToPlay = function (e) {
            fastdom.write(function () {
                $(e.currentTarget).parent().addClass(hoverStateClassName);
            });
        };

        var removeIntentToPlay = function (e) {
            $(e.currentTarget).parent().removeClass(hoverStateClassName);
        };

        bean.on(document.body, 'mouseenter', selector, showIntentToPlay);
        bean.on(document.body, 'mouseleave', selector, removeIntentToPlay);
    }

    function initTests() {
        if(ab.isInVariant('VideoYellowButton', 'variant')) {
            initYellowPlayButton();
        }
    }

    function init() {
        // The `hasMultipleVideosInPage` flag is temporary until the # will be fixed
        var shouldPreroll = commercialFeatures.videoPreRolls &&
            !config.page.hasMultipleVideosInPage &&
            !config.page.isAdvertisementFeature &&
            !config.page.sponsorshipType;

        if (config.switches.enhancedMediaPlayer) {
            if (shouldPreroll) {
                require(['js!//imasdk.googleapis.com/js/sdkloader/ima3.js']).then(function () {
                    initWithRaven(true);
                }, function (e) {
                    raven.captureException(e, { tags: { feature: 'media', action: 'ads' } });
                    initWithRaven();
                });
            } else {
                initWithRaven();
            }
        }
        initFacia();
        initMoreInSection();
        initOnwardContainer();
        initTests();
    }

    return {
        init: init
    };
});
