/* global videojs */
define([
    'bean',
    'bonzo',
    'raven',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/defer-to-analytics',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/preferences',
    'common/utils/url',
    'common/modules/analytics/omnitureMedia',
    'common/modules/commercial/build-page-targeting',
    'common/modules/component',
    'common/modules/onward/history',
    'common/modules/ui/images',
    'common/modules/video/tech-order',
    'common/modules/video/supportedBrowsers',
    'common/modules/analytics/beacon',
    'text!common/views/ui/loading.html',
    'text!common/views/ui/video-ads-overlay.html',
    'text!common/views/ui/video-ads-skip-overlay.html'
], function (
    bean,
    bonzo,
    raven,
    _,
    $,
    ajax,
    config,
    deferToAnalytics,
    detect,
    mediator,
    preferences,
    urlUtils,
    OmnitureMedia,
    buildPageTargeting,
    Component,
    history,
    images,
    techOrder,
    supportedBrowsers,
    beacon,
    loadingTmpl,
    adsOverlayTmpl,
    adsSkipOverlayTmpl
) {
    var isDesktop = detect.isBreakpoint({ min: 'desktop' }),
        QUARTILES = [25, 50, 75],
        // Advert and content events used by analytics. The expected order of bean events is:
        EVENTS = [
            'preroll:request',
            'preroll:ready',
            'preroll:play',
            'preroll:end',
            'content:ready',
            'content:play',
            'content:end'
        ];

    function getMediaType(player) {
        return player.guMediaType;
    }

    function shouldAutoPlay(player) {
        return isDesktop && !history.isRevisit(config.page.pageId) && player.guAutoplay;
    }

    function constructEventName(eventName, player) {
        return getMediaType(player) + ':' + eventName;
    }

    function ophanRecord(id, event, player) {
        if (id) {
            require('ophan/ng', function (ophan) {
                var eventObject = {};
                eventObject[getMediaType(player)] = {
                    id: id,
                    eventType: event.type
                };
                ophan.record(eventObject);
            });
        }
    }

    function initOphanTracking(player, mediaId) {
        EVENTS.concat(QUARTILES.map(function (q) {
            return 'play:' + q;
        })).forEach(function (event) {
            player.one(constructEventName(event, player), function (event) {
                ophanRecord(mediaId, event, player);
            });
        });
    }

    function initOmnitureTracking(player) {
        new OmnitureMedia(player).init();
    }

    function bindPrerollEvents(player) {
        var events = {
            end: function () {
                player.trigger(constructEventName('preroll:end', player));
                player.removeClass('vjs-ad-playing--vpaid');
                bindContentEvents(player, true);
            },
            start: function () {
                var duration = player.duration();
                if (duration) {
                    player.trigger(constructEventName('preroll:play', player));
                } else {
                    player.one('durationchange', events.start);
                }
            },
            vpaidStarted: function () {
                player.addClass('vjs-ad-playing--vpaid');
            },
            ready: function () {
                player.trigger(constructEventName('preroll:ready', player));

                player.one('adstart', events.start);
                player.one('adend', events.end);

                // Handle custom event to understand when vpaid is playing;
                // there is a lag between 'adstart' and 'Vpaid::AdStarted'.
                player.one('Vpaid::AdStarted', events.vpaidStarted);

                if (shouldAutoPlay(player)) {
                    player.play();
                }
            }
        };
        player.one('adsready', events.ready);

        //If no preroll avaliable or preroll fails, cancel ad framework and init content tracking
        player.one('adtimeout', function () {
            player.trigger('adscanceled');
            bindContentEvents(player);
        });
    }

    function bindContentEvents(player) {
        var events = {
            end: function () {
                player.trigger(constructEventName('content:end', player));
            },
            play: function () {
                var duration = player.duration();
                if (duration) {
                    player.trigger(constructEventName('content:play', player));
                } else {
                    player.one('durationchange', events.play);
                }
            },
            timeupdate: function () {
                var progress = Math.round(parseInt(player.currentTime() / player.duration() * 100, 10));
                QUARTILES.reverse().some(function (quart) {
                    if (progress >= quart) {
                        player.trigger(constructEventName('play:' + quart, player));
                        return true;
                    } else {
                        return false;
                    }
                });
            },
            ready: function () {
                player.trigger(constructEventName('content:ready', player));

                player.one('play', events.play);
                player.on('timeupdate', _.throttle(events.timeupdate, 1000));
                player.one('ended', events.end);

                if (shouldAutoPlay(player)) {
                    player.play();
                }
            }
        };
        events.ready();
    }

    function beaconError(err) {
        if (err && 'message' in err && 'code' in err) {
            raven.captureException(new Error(err.message), {
                tags: {
                    feature: 'player',
                    vjsCode: err.code
                }
            });
        }
    }

    function handleInitialMediaError(player) {
        var err = player.error();
        if (err !== null) {
            beaconError(err);
            return err.code === 4;
        }
        return false;
    }

    function bindErrorHandler(player) {
        player.on('error', function () {
            beaconError(player.error());
            $('.vjs-big-play-button').hide();
        });
    }

    function getVastUrl() {
        var adUnit = config.page.adUnit,
            custParams = urlUtils.constructQuery(buildPageTargeting()),
            encodedCustParams = encodeURIComponent(custParams),
            timestamp = new Date().getTime();
        return 'http://' + config.page.dfpHost + '/gampad/ads?correlator=' + timestamp + '&gdfp_req=1&env=vp&impl=s&output=' +
                'xml_vast2&unviewed_position_start=1&iu=' + adUnit + '&sz=400x300&scp=slot%3Dvideo&cust_params=' + encodedCustParams;
    }

    function adCountdown() {
        var player = this,
            events =  {
                destroy: function () {
                    $('.js-ads-overlay', this.el()).remove();
                    this.off('timeupdate', events.update);
                },
                update: function () {
                    if (this.currentTime() > 0.1) {
                        $('.vjs-ads-overlay').removeClass('vjs-ads-overlay--not-started');
                    }
                    if (parseInt(this.currentTime().toFixed(), 10) === 5) {
                        $('.vjs-ads-overlay-top').addClass('vjs-ads-overlay-top--animate-hide');
                    }
                },
                init: function () {
                    $(this.el()).append($.create(adsOverlayTmpl));
                    this.on('timeupdate', events.update.bind(this));
                    this.one(constructEventName('preroll:end', player), events.destroy.bind(player));
                    this.one(constructEventName('content:play', player), events.destroy.bind(player));
                    this.one('adtimeout', events.destroy.bind(player));
                }
            };
        this.one(constructEventName('preroll:play', player), events.init.bind(player));
    }

    function adSkipCountdown(skipTimeout) {
        var player = this,
            events =  {
                update: function () {
                    var skipTime = parseInt((skipTimeout - this.currentTime()).toFixed(), 10);
                    if (skipTime > 0) {
                        $('.js-skip-remaining-time', this.el()).text(skipTime);
                    } else if (!skipTime) {
                        $('.vjs-ads-overlay-skip-countdown', this.el())
                            .html('<button class="vjs-ads-overlay-skip-button" data-link-name="Skip video advert">' +
                            '<i class="i i-play-icon-grey skip-icon"></i>' +
                            '<i class="i i-play-icon-gold skip-icon"></i>Skip advert</button>');
                        $('.vjs-ads-overlay-skip').addClass('vjs-ads-overlay-skip--enabled');
                    }
                },
                skip: function () {
                    if ($('.vjs-ads-overlay-skip').hasClass('vjs-ads-overlay-skip--enabled')) {
                        events.hide.bind(player);
                        player.trigger(constructEventName('preroll:skip', player));
                        this.ads.endLinearAdMode();
                    }
                },
                hide: function () {
                    $('.js-ads-skip-overlay', this.el()).hide();
                    this.off('timeupdate', events.update);
                },
                init: function () {
                    $(this.el()).append($.create(adsSkipOverlayTmpl));
                    bean.on($('.vjs-ads-overlay-skip')[0], 'click', events.skip.bind(player));
                    this.on('timeupdate', events.update.bind(player));
                    this.one(constructEventName('content:play', player), events.hide.bind(player));
                    $('.js-skip-remaining-time', this.el()).text(parseInt(skipTimeout, 10).toFixed());
                }
            };
        this.one(constructEventName('preroll:play', player), events.init.bind(player));
    }

    function fullscreener() {
        var player = this,
            clickbox = bonzo.create('<div class="vjs-fullscreen-clickbox"></div>')[0],
            events = {
                click: function (e) {
                    this.paused() ? this.play() : this.pause();
                    e.stop();
                },
                dblclick: function (e) {
                    e.stop();
                    this.isFullScreen() ? this.exitFullscreen() : this.requestFullscreen();
                }
            };

        bonzo(clickbox)
            .appendTo(player.contentEl());

        bean.on(clickbox, 'click', events.click.bind(player));
        bean.on(clickbox, 'dblclick', events.dblclick.bind(player));
    }

    function initLoadingSpinner(player) {
        player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
    }

    // The Flash player does not copy its events to the dom as the HTML5 player does. This makes some
    // integrations difficult. These events are so that other libraries (e.g. Ophan) can hook into events without
    // needing to know about videojs
    function bindGlobalEvents(player) {
        player.on('playing', function () {
            bean.fire(document.body, 'videoPlaying');
        });
        player.on('pause', function () {
            bean.fire(document.body, 'videoPause');
        });
        player.on('ended', function () {
            bean.fire(document.body, 'videoEnded');
        });
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
        var player;

        player = videojs(el, options);

        // we have some special autoplay rules, so do not want to depend on 'default' autoplay
        player.guAutoplay = $(el).attr('data-auto-play') === 'true';

        if (handleInitialMediaError(player)) {
            player.dispose();
            options.techOrder = techOrder(el).reverse();
            player = videojs(el, options);
        }

        return player;
    }

    // Apologies for the slightly hacky nature of this.
    // Improvements welcomed...
    function isFlash(event) {
        return event.target.firstChild &&
            event.target.firstChild.id &&
            event.target.firstChild.id.indexOf('flash_api') > 0;
    }

    function initPlayer() {

        // When possible, use our CDN instead of a third party (zencoder).
        if (config.page.videoJsFlashSwf) {
            videojs.options.flash.swf = config.page.videoJsFlashSwf;
        }
        videojs.plugin('adCountdown', adCountdown);
        videojs.plugin('adSkipCountdown', adSkipCountdown);
        videojs.plugin('fullscreener', fullscreener);

        $('.js-gu-media--enhance').each(function (el) {
            enhanceVideo(el);
        });

        $('.js-video-wrapper').each(function (el) {
            bean.on($('.js-video-play-button', el).get(0), 'click', function () {
                var placeholder, player;
                // show the container with the same data-id as us
                placeholder = $('.js-video-placeholder', el);
                placeholder.removeClass('media__placeholder--active').addClass('media__placeholder--hidden');
                player = $('.js-video-player', el);
                player.removeClass('media__container--hidden').addClass('media__container--active');
                enhanceVideo($('video', player).get(0));
            });
        });
    }

    function enhanceVideo(el) {
        var mediaType = el.tagName.toLowerCase(),
            $el = bonzo(el).addClass('vjs vjs-tech-' + videojs.options.techOrder[0]),
            mediaId = $el.attr('data-media-id'),
            blockVideoAds = $el.attr('data-block-video-ads') === 'true',
            showEndSlate = $el.attr('data-show-end-slate') === 'true',
            endSlateUri = $el.attr('data-end-slate'),
            embedPath = $el.attr('data-embed-path'),
            techPriority = techOrder(el),
            player,
            mouseMoveIdle;

        if (config.page.videoJsVpaidSwf && config.switches.vpaidAdverts) {

            // clone the video options and add 'vpaid' to them.
            techPriority = ['vpaid'].concat(techPriority);

            videojs.options.vpaid = {swf: config.page.videoJsVpaidSwf};
        }

        player = createVideoPlayer(el, {
            techOrder: techPriority,
            controls: true,
            autoplay: true,
            preload: 'auto', // preload='none' & autoplay breaks ad loading on chrome35, preload="metadata" breaks older Safari's
            plugins: {
                embed: {
                    embeddable: !config.page.isFront && config.switches.externalVideoEmbeds && $el.attr('data-embeddable') === 'true',
                    location: config.page.externalEmbedHost + (embedPath ? embedPath : config.page.pageId)
                }
            }
        });

        // Location of this is important.
        bindErrorHandler(player);

        player.guMediaType = mediaType;

        player.ready(function () {
            var vol;

            initLoadingSpinner(player);
            bindGlobalEvents(player);
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

            deferToAnalytics(function () {

                initOmnitureTracking(player);
                initOphanTracking(player, mediaId);

                // preroll for videos only
                if (mediaType === 'video') {

                    player.fullscreener();

                    // Init plugins
                    if (config.switches.videoAdverts && !blockVideoAds && !config.page.isPreview) {
                        bindPrerollEvents(player);
                        player.adCountdown();
                        player.adSkipCountdown(15);

                        // Video analytics event.
                        player.trigger(constructEventName('preroll:request', player));

                        player.ads({
                            timeout: 3000
                        });
                        player.vast({
                            url: getVastUrl()
                        });
                    } else {
                        bindContentEvents(player);
                    }

                    if (showEndSlate && detect.isBreakpoint({ min: 'desktop' })) {
                        initEndSlate(player, endSlateUri);
                    }
                } else {
                    player.playlist({
                        mediaType: 'audio',
                        continuous: false
                    });

                    bindContentEvents(player);
                }
            });
        });

        mouseMoveIdle = _.debounce(function () { player.removeClass('vjs-mousemoved'); }, 500);

        // built in vjs-user-active is buggy so using custom implementation
        player.on('mousemove', function () {
            player.addClass('vjs-mousemoved');
            mouseMoveIdle();
        });
    }

    function initEndSlate(player, endSlatePath) {
        var endSlate = new Component(),
            endState = 'vjs-has-ended';

        endSlate.endpoint = endSlatePath;
        endSlate.fetch(player.el(), 'html');

        player.one(constructEventName('content:play', player), function () {
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
            images.upgrade(attachTo);
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
            images.upgrade(attachTo);
        });
    }

    function ready() {
        if (config.switches.enhancedMediaPlayer) {
            require('bootstraps/video-player', raven.wrap(
                { tags: { feature: 'media' } },
                initPlayer
            ));
        }
        initMoreInSection();
        initMostViewedMedia();

        mediator.emit('page:media:ready');
    }

    return {
        init: ready
    };
});
