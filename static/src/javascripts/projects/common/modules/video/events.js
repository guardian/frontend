/* global guardian */
define([
    'bean',
    'qwery',
    'common/utils/report-error',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/analytics/omnitureMedia',
    'common/modules/onward/history',
    'text!common/views/ui/video-ads-skip-overlay.html',
    'lodash/arrays/indexOf',
    'lodash/functions/throttle'
], function (
    bean,
    qwery,
    reportError,
    $,
    config,
    detect,
    template,
    OmnitureMedia,
    history,
    adsSkipOverlayTmpl,
    indexOf,
    throttle) {
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
            require([ophanPath], function (ophan) {
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
            return 'content:' + q;
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
        },
        adFailed = function () {
            bindContentEvents(player);
            if (shouldAutoPlay(player)) {
                player.play();
            }
            // Remove both handlers, because this adFailed handler should only happen once.
            player.off('adtimeout', adFailed);
            player.off('adserror', adFailed);
        };

        player.one('adsready', events.ready);

        //If no preroll avaliable or preroll fails, cancel ad framework and init content tracking.
        player.one('adtimeout', adFailed);
        player.one('adserror', adFailed);
    }

    function kruxTracking(player, event) {
        var desiredVideos = ['gu-video-457263940', 'gu-video-55e4835ae4b00856194f85c2'];
        //test videos /artanddesign/video/2015/jun/25/damien-hirst-paintings-john-hoyland-newport-street-gallery-london-video
        ///music/video/2015/aug/31/vmas-2015-highlights-video


        if (config.switches.kruxVideoTracking && config.switches.krux && $(player.el()).attr('data-media-id') && indexOf(desiredVideos, $(player.el()).attr('data-media-id')) !== -1) {
            if (event === 'videoPlaying') {
                //Krux is a global object loaded by krux.js file

                /*eslint-disable */
                Krux('admEvent', 'KAIQvckS', {});
                /*eslint-enable */

            } else if (event === 'videoEnded') {

                /*eslint-disable */
                Krux('admEvent', 'KBaTegd5', {});
                /*eslint-enable */
            }
        }

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
                        player.trigger(constructEventName('content:' + quart, player));
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
    }

    // The Flash player does not copy its events to the dom as the HTML5 player does. This makes some
    // integrations difficult. These events are so that other libraries (e.g. Ophan) can hook into events without
    // needing to know about videojs
    function bindGlobalEvents(player) {
        player.on('playing', function () {
            kruxTracking(player, 'videoPlaying');
            bean.fire(document.body, 'videoPlaying');
        });
        player.on('pause', function () {
            bean.fire(document.body, 'videoPause');
        });
        player.on('ended', function () {
            bean.fire(document.body, 'videoEnded');
            kruxTracking(player, 'videoEnded');
        });
    }

    function adSkipCountdown(skipTimeout) {
        var intervalId,
            events = {
                update: function () {
                    var adsManager  = this.ima.getAdsManager(),
                        currentTime = adsManager.getCurrentAd().getDuration() - adsManager.getRemainingTime(),
                        skipTime    = parseInt((skipTimeout - currentTime).toFixed(), 10);

                    if (skipTime > 0) {
                        $('.js-skip-remaining-time', this.el()).text(skipTime);
                    } else {
                        window.clearInterval(intervalId);
                        $('.js-ads-skip', this.el())
                            .html(
                                '<button class="js-ads-skip-button vjs-ads-skip__button" data-link-name="Skip video advert">' +
                                    '<i class="i i-play-icon-grey skip-icon"></i>' +
                                    '<i class="i i-play-icon-gold skip-icon"></i>Skip advert' +
                                '</button>'
                            );
                        bean.on(qwery('.js-ads-skip-button')[0], 'click', events.skip.bind(this));
                    }
                },
                skip: function () {
                    // jscs:disable disallowDanglingUnderscores
                    $('.js-ads-skip', this.el()).hide();
                    this.trigger(constructEventName('preroll:skip', this));
                    // in lieu of a 'skip' api, rather hacky way of achieving it
                    this.ima.onAdComplete_();
                    this.ima.onContentResumeRequested_();
                    this.ima.getAdsManager().stop();
                },
                init: function () {
                    var skipButton = template(adsSkipOverlayTmpl, { skipTimeout: skipTimeout });

                    $(this.el()).append(skipButton);
                    intervalId = setInterval(events.update.bind(this), 250);

                },
                end: function () {
                    $('.js-ads-skip', this.el()).hide();
                    window.clearInterval(intervalId);
                }
            };

        this.one(constructEventName('preroll:play', this), events.init.bind(this));
        this.one(constructEventName('preroll:end', this), events.end.bind(this));
    }

    function beaconError(err) {
        if (err && 'message' in err && 'code' in err) {
            reportError(new Error(err.message), {
                feature: 'player',
                vjsCode: err.code
            }, false);
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
        adSkipCountdown: adSkipCountdown,
        handleInitialMediaError: handleInitialMediaError,
        bindErrorHandler: bindErrorHandler
    };
});
