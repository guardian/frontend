/* global videojs */
define([
    'bean',
    'bonzo',
    'raven',
    'lodash/collections/find',
    'lodash/functions/throttle',
    'lodash/objects/isFunction',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/deferToAnalytics',
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
    find,
    throttle,
    isFunction,
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
    var modules, ready,
        isDesktop = detect.isBreakpoint({ min: 'desktop' }),
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
        var mediaEl = player && isFunction(player.el) ? player.el().children[0] : undefined;
        return mediaEl ? mediaEl.tagName.toLowerCase() : 'video';
    }

    function shouldAutoPlay(player) {
        var pageHasBeenSeen = find(history.get(), function (historyItem) {
            return (historyItem.id === '/' + config.page.pageId) && historyItem.count > 1;
        });
        return $('.vjs-tech', player.el()).attr('data-auto-play') === 'true' && isDesktop && !pageHasBeenSeen;
    }

    function constructEventName(eventName, player) {
        return getMediaType(player) + ':' + eventName;
    }

    modules = {
        ophanRecord: function (id, event, player) {
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
        },

        initOphanTracking: function (player, mediaId) {
            EVENTS.concat(QUARTILES.map(function (q) {
                return 'play:' + q;
            })).forEach(function (event) {
                player.one(constructEventName(event, player), function (event) {
                    modules.ophanRecord(mediaId, event, player);
                });
            });
        },

        initOmnitureTracking: function (player) {
            new OmnitureMedia(player).init();
        },

        bindPrerollEvents: function (player) {
            var events = {
                end: function () {
                    player.trigger(constructEventName('preroll:end', player));
                    modules.bindContentEvents(player, true);
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
                modules.bindContentEvents(player);
            });
        },

        bindContentEvents: function (player) {
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
                    player.on('timeupdate', throttle(events.timeupdate, 1000));
                    player.one('ended', events.end);

                    if (shouldAutoPlay(player)) {
                        player.play();
                    }
                }
            };
            events.ready();
        },

        beaconError: function (err) {
            if (err && 'message' in err) {
                raven.captureException(new Error(err.message), {
                    tags: {
                        feature: 'player',
                        code: err.code
                    }
                });
            }
        },

        handleInitialMediaError: function (player) {
            var err = player.error();
            if (err !== null) {
                modules.beaconError(err);
                return err.code === 4;
            }
            return false;
        },

        bindErrorHandler: function (player) {
            player.on('error', function (e) {
                modules.beaconError(e);
            });
        },

        getVastUrl: function () {
            var adUnit = config.page.adUnit,
                custParams = urlUtils.constructQuery(buildPageTargeting()),
                encodedCustParams = encodeURIComponent(custParams),
                timestamp = new Date().getTime();
            return 'http://' + config.page.dfpHost + '/gampad/ads?correlator=' + timestamp + '&gdfp_req=1&env=vp&impl=s&output=' +
                    'xml_vast2&unviewed_position_start=1&iu=' + adUnit + '&sz=400x300&scp=slot%3Dvideo&cust_params=' + encodedCustParams;
        },

        countDown: function () {
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
        },

        fullscreener: function () {
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
        },

        initLoadingSpinner: function (player) {
            player.loadingSpinner.contentEl().innerHTML =
                '<div class="pamplemousse">' +
                '<div class="pamplemousse__pip"><i></i></div>' +
                '<div class="pamplemousse__pip"><i></i></div>' +
                '<div class="pamplemousse__pip"><i></i></div>' +
                '</div>';
        },

        createVideoObject: function (el, options) {
            var vjs;

            options.techOrder = ['html5', 'flash'];
            vjs = videojs(el, options);

            if (modules.handleInitialMediaError(vjs)) {
                vjs.dispose();
                options.techOrder = ['flash', 'html5'];
                vjs = videojs(el, options);
            }

            return vjs;
        },

        initPlayer: function () {

            if (!config.switches.enhancedMediaPlayer) {
                return;
            }

            require('bootstraps/video-player', function () {

                videojs.plugin('adCountDown', modules.countDown);
                videojs.plugin('fullscreener', modules.fullscreener);

                $('.js-gu-media').each(function (el) {
                    var timeout,
                        mediaType = el.tagName.toLowerCase(),
                        $el = bonzo(el).addClass('vjs'),
                        mediaId = $el.attr('data-media-id'),
                        blockVideoAds = $el.attr('data-block-video-ads') === 'true',
                        showEndSlate = $el.attr('data-show-end-slate') === 'true',
                        endSlateUri = $el.attr('data-end-slate'),
                        vjs = modules.createVideoObject(el, {
                            controls: true,
                            autoplay: false,
                            preload: 'metadata' // preload='none' & autoplay breaks ad loading on chrome35
                        });

                    //Location of this is important
                    modules.handleInitialMediaError(vjs);

                    vjs.ready(function () {
                        var vol,
                            player = this;

                        modules.bindErrorHandler(player);
                        modules.initLoadingSpinner(player);

                        // unglitching the volume on first load
                        vol = vjs.volume();
                        if (vol) {
                            vjs.volume(0);
                            vjs.volume(vol);
                        }

                        vjs.persistvolume({namespace: 'gu.vjs'});

                        deferToAnalytics(function () {

                            modules.initOmnitureTracking(player);
                            modules.initOphanTracking(player, mediaId);

                            // preroll for videos only
                            if (mediaType === 'video') {

                                player.fullscreener();

                                // Init plugins
                                if (config.switches.videoAdverts && !blockVideoAds && !config.page.isPreview) {
                                    modules.bindPrerollEvents(player);
                                    player.adCountDown();
                                    player.trigger(constructEventName('preroll:request', player));
                                    player.ads({
                                        timeout: 3000
                                    });
                                    player.vast({
                                        url: modules.getVastUrl()
                                    });
                                } else {
                                    modules.bindContentEvents(player);
                                }

                                if (showEndSlate && detect.isBreakpoint({ min: 'desktop' })) {
                                    modules.initEndSlate(player, endSlateUri);
                                }
                            } else {
                                vjs.playlist({
                                    mediaType: 'audio',
                                    continuous: false
                                });

                                modules.bindContentEvents(player);
                            }
                        });
                    });

                    // built in vjs-user-active is buggy so using custom implementation
                    vjs.on('mousemove', function () {
                        if (timeout) {
                            clearTimeout(timeout);
                        } else {
                            vjs.addClass('vjs-mousemoved');
                        }
                        timeout = setTimeout(function () {
                            vjs.removeClass('vjs-mousemoved');
                            timeout = false;
                        }, 500);
                    });
                });
            });
        },
        initEndSlate: function (player, endSlatePath) {
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
        },
        initMoreInSection: function () {
            if (!config.isMedia || !config.page.showRelatedContent) {
                return;
            }
            var mediaType = config.page.contentType.toLowerCase(),
                section = new Component(),
                parentEl = $('.js-onward')[0];

            section.endpoint = '/' + mediaType + '/section/' + config.page.section;

            if ('seriesId' in config.page) {
                section.endpoint += '/' + config.page.seriesId;
            }

            section.endpoint += '.json?shortUrl=' + config.page.shortUrl;

            section.fetch(parentEl).then(function () {
                images.upgrade(parentEl);
            });
        },
        initMostViewedMedia: function () {
            if (!config.isMedia) {
                return;
            }
            var mediaType = config.page.contentType.toLowerCase(),
                attachTo = $(mediaType === 'video' ? '.js-video-components-container' : '.js-media-popular')[0],
                mostViewed = new Component(),
                endpoint = '/' + (config.page.isPodcast ? 'podcast' : mediaType) + '/most-viewed.json';

            mostViewed.manipulationType = mediaType === 'video' ? 'append' : 'html';
            mostViewed.endpoint = endpoint;
            mostViewed.fetch(attachTo, 'html')
                .then(function () {
                    images.upgrade(attachTo);
                });
        }
    },
    ready = function () {
        modules.initPlayer();
        modules.initMoreInSection();
        modules.initMostViewedMedia();

        mediator.emit('page:media:ready');
    };

    return {
        init: ready
    };
});
