define([
    'bean',
    'qwery',
    'lib/mediator',
    'lib/report-error',
    'lib/$',
    'lib/config',
    'lib/detect',
    'common/modules/onward/history',
    'lodash/arrays/indexOf',
    'lodash/functions/throttle',
    'lodash/objects/forOwn',
    'common/modules/video/ga-helper',
    'ophan/ng'
], function (
    bean,
    qwery,
    mediator,
    reportError,
    $,
    config,
    detect,
    history,
    indexOf,
    throttle,
    forOwn,
    gaHelper,
    ophan
) {
    var isDesktop = detect.isBreakpoint({ min: 'desktop' }),
        isEmbed = !!window.guardian.isEmbed,
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
        ],
        gaTracker = config.googleAnalytics.trackers.editorial;

    /**
     *
     * @param mediaId {string}
     * @param mediaType {string} audio|video
     * @param eventType {string} e.g. firstplay, firstend
     * @param isPreroll {boolean}
     * @returns {{mediaId: string, mediaType: string, eventType: string, isPreroll: boolean}}
     */
    function MediaEvent(mediaId, mediaType, eventType, isPreroll) {
        return {
            mediaId: mediaId,
            mediaType: mediaType,
            eventType: eventType,
            isPreroll: isPreroll
        };
    }

    function bindCustomMediaEvents(eventsMap, player, mediaId, mediaType, isPreroll) {
        forOwn(eventsMap, function(value, key) {
            var fullEventName = 'media:' + value;
            var mediaEvent = MediaEvent(mediaId, mediaType, value, isPreroll);

            player.one(key, function() {
                player.trigger(fullEventName, mediaEvent);
                mediator.emit(fullEventName, mediaEvent);
            });
        });
    }

    function addContentEvents(player, mediaId, mediaType) {
        var eventsMap = {
            ready: 'ready',
            play: 'play',
            passed25: 'watched25',
            passed50: 'watched50',
            passed75: 'watched75',
            ended: 'end'
        };

        player.on('timeupdate', throttle(function() {
            var percent = Math.round((player.currentTime() / player.duration()) * 100);

            if (percent >= 25) {
                player.trigger('passed25');
            }
            if (percent >= 50) {
                player.trigger('passed50');
            }
            if (percent >= 75) {
                player.trigger('passed75');
            }
        }, 1000));

        bindCustomMediaEvents(eventsMap, player, mediaId, mediaType, false);
    }

    function addPrerollEvents(player, mediaId, mediaType) {
        var eventsMap = {
            'adstart': 'play',
            'adend': 'end',
            'adsready': 'ready',
            // This comes from the skipAd plugin
            'adskip': 'skip'
        };

        bindCustomMediaEvents(eventsMap, player, mediaId, mediaType, true);
    }

    function bindGoogleAnalyticsEvents(player, canonicalUrl) {
        var events = {
            'play': 'metric1',
            'skip': 'metric2',
            'watched25': 'metric3',
            'watched50': 'metric4',
            'watched75': 'metric5',
            'end': 'metric6'
        };

        Object.keys(events).map(function(eventName) {
            return 'media:' + eventName;
        }).forEach(function(playerEvent) {
            player.on(playerEvent, function(_, mediaEvent) {
                window.ga(gaTracker + '.send', 'event', gaHelper.buildGoogleAnalyticsEvent(mediaEvent, events, canonicalUrl,
                    'guardian-videojs', gaHelper.getGoogleAnalyticsEventAction, mediaEvent.mediaId));
            });
        });
    }

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
        if (!id) return;

        function record(ophan) {
            var eventObject = {};
            eventObject[getMediaType(player)] = {
                id: id,
                eventType: event.type
            };
            ophan.record(eventObject);
        }

        if (isEmbed) {
            require(['ophan/embed'], record);
        } else {
            record(ophan);
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

    function bindPrerollEvents(player) {
        var events = {
            end: function () {
                player.trigger(constructEventName('preroll:end', player));
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
            ready: function () {
                player.trigger(constructEventName('preroll:ready', player));

                player.one('adstart', events.start);
                player.one('adend', events.end);

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

    // These events are so that other libraries (e.g. Ophan) can hook into events without
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
        handleInitialMediaError: handleInitialMediaError,
        bindErrorHandler: bindErrorHandler,
        addContentEvents: addContentEvents,
        addPrerollEvents: addPrerollEvents,
        bindGoogleAnalyticsEvents: bindGoogleAnalyticsEvents
    };
});
