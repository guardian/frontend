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
    'common/modules/ui/images'
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
    images
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
        return isDesktop && !history.isRevisit(config.page.pageId) && $('.vjs-tech', player.el()).attr('data-auto-play') === 'true';
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
                bindContentEvents(player, true);
            },
            play: function () {
                var duration = player.duration();
                if (duration) {
                    player.trigger(constructEventName('preroll:play', player));
                } else {
                    player.one('durationchange', events.play);
                }
            },
            ready: function () {
                player.trigger(constructEventName('preroll:ready', player));

                player.one('adstart', events.play);
                player.one('adend', events.end);

                if (shouldAutoPlay(player)) {
                    player.play();
                }
            }
        };
        player.one('adsready', events.ready);

        //If no preroll avaliable or preroll fails, still init content tracking
        player.one('adtimeout', function () {
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
        if (err && 'message' in err) {
            raven.captureException(new Error(err.message), {
                tags: {
                    feature: 'player',
                    code: err.code
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
        player.on('error', function (e) {
            beaconError(e);
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
            tmp = '<div class="vjs-ads-overlay js-ads-overlay">Your video will start in <span class="vjs-ads-overlay__remaining js-remaining-time"></span>' +
                  ' seconds <span class="vjs-ads-overlay__label">Advertisement</span></div>',
            events =  {
                destroy: function () {
                    $('.js-ads-overlay', this.el()).remove();
                    this.off('timeupdate', events.update);
                },
                update: function () {
                    $('.js-remaining-time', this.el()).text(parseInt(this.duration() - this.currentTime(), 10).toFixed());
                },
                init: function () {
                    $(this.el()).append($.create(tmp));
                    this.on('timeupdate', events.update.bind(this));
                    this.one(constructEventName('preroll:end', player), events.destroy.bind(player));
                    this.one(constructEventName('content:play', player), events.destroy.bind(player));
                    this.one('adtimeout', events.destroy.bind(player));
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
        player.loadingSpinner.contentEl().innerHTML =
            '<div class="pamplemousse">' +
            '<div class="pamplemousse__pip"><i></i></div>' +
            '<div class="pamplemousse__pip"><i></i></div>' +
            '<div class="pamplemousse__pip"><i></i></div>' +
            '</div>';
    }

    function createVideoPlayer(el, options) {
        var player;

        player = videojs(el, options);

        if (handleInitialMediaError(player)) {
            player.dispose();
            options.techOrder = ['flash', 'html5'];
            player = videojs(el, options);
        }

        return player;
    }

    function initPlayer() {

        // When possible, use our CDN instead of a third party (zencoder).
        if (config.page.videoJsFlashSwf) {
            videojs.options.flash.swf = config.page.videoJsFlashSwf;
        }
        if (config.page.videoJsVpaidSwf && config.switches.vpaidAdverts) {
            videojs.options.techOrder = ['vpaid', 'html5', 'flash'];
            videojs.options.vpaid = {swf: config.page.videoJsVpaidSwf};
        }

        videojs.plugin('adCountdown', adCountdown);
        videojs.plugin('fullscreener', fullscreener);

        $('.js-gu-media').each(function (el) {
            var mediaType = el.tagName.toLowerCase(),
                $el = bonzo(el).addClass('vjs'),
                mediaId = $el.attr('data-media-id'),
                blockVideoAds = $el.attr('data-block-video-ads') === 'true',
                showEndSlate = $el.attr('data-show-end-slate') === 'true',
                endSlateUri = $el.attr('data-end-slate'),
                player = createVideoPlayer(el, {
                    controls: true,
                    autoplay: false,
                    preload: 'metadata' // preload='none' & autoplay breaks ad loading on chrome35
                }),
                mouseMoveIdle;

            player.guMediaType = mediaType;

            //Location of this is important
            handleInitialMediaError(player);

            player.ready(function () {
                var vol;

                bindErrorHandler(player);
                initLoadingSpinner(player);

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
