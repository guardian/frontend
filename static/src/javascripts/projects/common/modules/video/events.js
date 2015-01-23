/* global guardian */
define([
    'bean',
    'raven',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/analytics/omnitureMedia',
    'text!common/views/ui/video-ads-overlay.html',
    'text!common/views/ui/video-ads-skip-overlay.html'
], function (
    bean,
    raven,
    _,
    config,
    detect,
    OmnitureMedia,
    adsOverlayTmpl,
    adsSkipOverlayTmpl
) {
    var isDesktop = detect.isBreakpoint({ min: 'desktop' }),
        isEmbed = !!guardian.isEmbed,
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
        return isEmbed ? 'video' : player.guMediaType;
    }

    function shouldAutoPlay(player) {
        return isDesktop && !history.isRevisit(config.page.pageId) && player.guAutoplay;
    }

    function constructEventName(eventName, player) {
        return getMediaType(player) + ':' + eventName;
    }

    function ophanRecord(id, event, player) {
        var ophanPath = isEmbed ? 'ophan/embed' : 'ophan/ng';
        if (id) {
            require(ophanPath, function (ophan) {
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

    return {
        constructEventName: constructEventName,
        bindContentEvents: bindContentEvents,
        bindPrerollEvents: bindPrerollEvents,
        bindGlobalEvents: bindGlobalEvents,
        initOphanTracking: initOphanTracking,
        initOmnitureTracking: initOmnitureTracking,
        adCountdown: adCountdown,
        adSkipCountdown: adSkipCountdown,
        handleInitialMediaError: handleInitialMediaError,
        bindErrorHandler: bindErrorHandler
    };
});
