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
    'common/modules/analytics/beacon',
    'common/modules/commercial/build-page-targeting',
    'common/modules/commercial/commercial-features',
    'common/modules/component',
    'common/modules/video/events',
    'common/modules/video/fullscreener',
    'common/modules/video/supportedBrowsers',
    'common/modules/video/tech-order',
    // This must be the full path because we use curl config to change it based
    // on env
    'bootstraps/enhanced/media/video-player',
    'text!common/views/ui/loading.html',
    'common/modules/experiments/ab'
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
    beacon,
    buildPageTargeting,
    commercialFeatures,
    Component,
    events,
    fullscreener,
    supportedBrowsers,
    techOrder,
    videojs,
    loadingTmpl,
    ab
) {
    // For the A/B test
    var abVideoAutoplay = ab.testCanBeRun('BolivianWrestlingAutoplay');
    function elementIsInView(el, offset) {
        var viewportHeight = window.innerHeight;
        var rect = el.getBoundingClientRect();
        var fromTop = rect.top + offset;
        var fromBottom = rect.bottom - offset;

        return fromTop < viewportHeight && fromBottom > 0;
    }

    function ElementViewable(element, offset, inViewOnloadCallbackOpt) {
        // This is rubbish, but we can refine it later.
        var inViewOnloadCallback = inViewOnloadCallbackOpt || function () {};
        var wasAlreadyInView = false;
        var events = {
            viewenter: function viewenter() {},
            viewexit: function viewexit() {}
        };
        // TODO: latch onto debounced event
        mediator.on('window:throttledScroll', function () {
            var inView = elementIsInView(element, offset);

            if (inView) {
                if (!wasAlreadyInView) {
                    wasAlreadyInView = true;
                    events.viewenter();
                }
            } else {
                if (wasAlreadyInView) {
                    wasAlreadyInView = false;
                    events.viewexit();
                }
                wasAlreadyInView = false;
            }
        });

        fastdomPromise.read(function () {
            wasAlreadyInView = elementIsInView(element, offset);
            return wasAlreadyInView;
        }).then(function (inView) {
            if (inView) {
                inViewOnloadCallback();
            }
        });

        return {
            on: function (event, func) {
                events[event] = func;
            }
        };
    }
    // End A/B test

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

        return 'http://' + config.page.dfpHost + '/gampad/ads?' + urlUtils.constructQuery(queryParams);
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
            blockVideoAds = $el.attr('data-block-video-ads') === 'true',
            showEndSlate = $el.attr('data-show-end-slate') === 'true',
            endSlateUri = $el.attr('data-end-slate'),
            embedPath = $el.attr('data-embed-path'),
            techPriority = techOrder(el),
            withPreroll = shouldPreroll && !blockVideoAds,
            player,
            mouseMoveIdle,
            playerSetupComplete;

        player = createVideoPlayer(el, {
            techOrder: techPriority,
            controls: true,
            // This is always set to false.
            // We use `autoplay` after we are certain the player is ready.
            autoplay: false,
            // preload='none' & autoplay breaks ad loading on chrome35.
            // preload="metadata" breaks older Safari's
            preload: 'auto',
            plugins: {
                embed: {
                    embeddable: !config.page.isFront && config.switches.externalVideoEmbeds && (config.page.contentType === 'Video' || $el.attr('data-embeddable') === 'true'),
                    location: config.page.externalEmbedHost + '/embed/video/' + (embedPath ? embedPath : config.page.pageId)
                }
            }
        });

        // Location of this is important.
        events.bindErrorHandler(player);
        player.guMediaType = mediaType;

        playerSetupComplete = new Promise(function (resolve) {
            player.ready(function () {
                var vol;

                deferToAnalytics(function () {
                    events.initOmnitureTracking(player);
                    events.initOphanTracking(player, mediaId);

                    events.bindGlobalEvents(player);
                    events.bindContentEvents(player);
                    if (withPreroll) {
                        events.bindPrerollEvents(player);
                    }
                });

                initLoadingSpinner(player);
                upgradeVideoPlayerAccessibility(player);
                supportedBrowsers(player);

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
                                player.adSkipCountdown(15);
                                player.ima({
                                    id: mediaId,
                                    adTagUrl: getAdUrl(),
                                    prerollTimeout: 1000
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

                    if (ab.isInVariant('BolivianWrestlingAutoplay', 'autoplay')) {
                        // Annoyingly we pass the `parentNode` as the video is absolutely positioned.
                        var parentNode = player.el().parentNode;
                        var firstAutoplay = true;
                        var elementInView = ElementViewable(parentNode, parentNode.clientHeight * (3 / 4), function () {
                            if (firstAutoplay) {
                                player.volume(0);
                                firstAutoplay = false;
                            }
                            player.play();
                        });
                        elementInView.on('viewenter', function autoplayInView() {
                            if (firstAutoplay) {
                                player.volume(0);
                                firstAutoplay = false;
                            }
                            player.play();
                        });
                        elementInView.on('viewexit', function autoStopInView() {
                            player.pause();
                        });
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

    function initMoreInSection() {
        if (!config.isMedia || !config.page.showRelatedContent) {
            return;
        }

        var mediaType = config.page.contentType.toLowerCase(),
            section   = new Component(),
            attachTo  = $('.js-onward')[0],
            endpoint  = '/' + mediaType + '/section/' + config.page.section;

        if ('seriesId' in config.page) {
            endpoint += '/' + config.page.seriesId;
        }

        endpoint += '.json?shortUrl=' + config.page.shortUrl;

        // exclude professional network content from video pages
        if (mediaType === 'video') {
            endpoint += '&exclude-tag=guardian-professional/guardian-professional';
        }

        section.endpoint = endpoint;

        section.fetch(attachTo).then(function () {
            mediator.emit('page:media:moreinloaded', attachTo);
            mediator.emit('page:new-content', attachTo);
        });
    }

    function initMostViewedMedia() {
        if (!config.isMedia) {
            return;
        }

        var mediaType  = config.page.contentType.toLowerCase(),
            mostViewed = new Component(),
            attachTo   = $(mediaType === 'video' ? '.js-video-components-container' : '.js-media-popular')[0],
            endpoint   = '/' + (config.page.isPodcast ? 'podcast' : mediaType) + '/most-viewed.json';

        mostViewed.manipulationType = mediaType === 'video' ? 'append' : 'html';
        mostViewed.endpoint = endpoint;

        mostViewed.fetch(attachTo, 'html').then(function () {
            mediator.emit('page:new-content');
        });
    }

    function initWithRaven(withPreroll) {
        raven.wrap(
            { tags: { feature: 'media' } },
            function () { initPlayer(withPreroll); }
        )();
    }

    function init() {
        // The `hasMultipleVideosInPage` flag is temporary until the #10034 will be fixed
        var shouldPreroll = commercialFeatures.videoPreRolls &&
            !config.page.hasMultipleVideosInPage &&
            !config.page.isAdvertisementFeature;

        if (config.switches.enhancedMediaPlayer) {
            if (shouldPreroll && !abVideoAutoplay) {
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
        initMoreInSection();
        initMostViewedMedia();
    }

    return {
        init: init
    };
});
