// @flow
import bean from 'bean';
import mediator from 'lib/mediator';
import reportError from 'lib/report-error';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import history from 'common/modules/onward/history';
import throttle from 'lodash/functions/throttle';
import forOwn from 'lodash/objects/forOwn';
import gaHelper from 'common/modules/video/ga-helper';
import ophan from 'ophan/ng';

/* global require */
declare function Krux(): void;

const isDesktop = detect.isBreakpoint({
    min: 'desktop',
});
const isEmbed = !!window.guardian.isEmbed;
const QUARTILES = [25, 50, 75];
// Advert and content events used by analytics. The expected order of bean events is:
const EVENTS = [
    'preroll:request',
    'preroll:ready',
    'preroll:play',
    'preroll:end',
    'content:ready',
    'content:play',
    'content:end',
];
const gaTracker = config.googleAnalytics.trackers.editorial;

const MediaEvent = (
    mediaId: string,
    mediaType: string,
    eventType: string,
    isPreroll: boolean
): Object => ({
    mediaId,
    mediaType,
    eventType,
    isPreroll,
});

const bindCustomMediaEvents = (
    eventsMap: Object,
    player: Object,
    mediaId: string,
    mediaType: string,
    isPreroll: boolean
): void => {
    forOwn(eventsMap, (value, key) => {
        const fullEventName = `media:${value}`;
        const mediaEvent = MediaEvent(mediaId, mediaType, value, isPreroll);

        player.one(key, () => {
            player.trigger(fullEventName, mediaEvent);
            mediator.emit(fullEventName, mediaEvent);
        });
    });
};

const addContentEvents = (
    player: Object,
    mediaId: any,
    mediaType: any
): void => {
    const eventsMap = {
        ready: 'ready',
        play: 'play',
        passed25: 'watched25',
        passed50: 'watched50',
        passed75: 'watched75',
        ended: 'end',
    };

    player.on(
        'timeupdate',
        throttle(() => {
            const percent = Math.round(
                player.currentTime() / player.duration() * 100
            );

            if (percent >= 25) {
                player.trigger('passed25');
            }
            if (percent >= 50) {
                player.trigger('passed50');
            }
            if (percent >= 75) {
                player.trigger('passed75');
            }
        }, 1000)
    );

    bindCustomMediaEvents(eventsMap, player, mediaId, mediaType, false);
};

const addPrerollEvents = (
    player: Object,
    mediaId: string,
    mediaType: string
) => {
    const eventsMap = {
        adstart: 'play',
        adend: 'end',
        adsready: 'ready',
        // This comes from the skipAd plugin
        adskip: 'skip',
    };

    bindCustomMediaEvents(eventsMap, player, mediaId, mediaType, true);
};

const bindGoogleAnalyticsEvents = (player: Object, canonicalUrl: string) => {
    const events = {
        play: 'metric1',
        skip: 'metric2',
        watched25: 'metric3',
        watched50: 'metric4',
        watched75: 'metric5',
        end: 'metric6',
    };

    Object.keys(events)
        .map(eventName => `media:${eventName}`)
        .forEach(playerEvent => {
            player.on(playerEvent, (_, mediaEvent) => {
                window.ga(
                    `${gaTracker}.send`,
                    'event',
                    gaHelper.buildGoogleAnalyticsEvent(
                        mediaEvent,
                        events,
                        canonicalUrl,
                        'guardian-videojs',
                        gaHelper.getGoogleAnalyticsEventAction,
                        mediaEvent.mediaId
                    )
                );
            });
        });
};

const getMediaType = player => (isEmbed ? 'video' : player.guMediaType);

const shouldAutoPlay = player =>
    isDesktop && !history.isRevisit(config.page.pageId) && player.guAutoplay;

const constructEventName = (
    eventName: string,
    player: Object
): string => `${getMediaType(player)}:${eventName}`;

const ophanRecord = (id: ?string, event: Object, player: Object) => {
    if (!id) return;

    const record = ophanEmbed => {
        const eventObject = {};
        eventObject[getMediaType(player)] = {
            id,
            eventType: event.type,
        };
        ophanEmbed.record(eventObject);
    };

    if (isEmbed) {
        require.ensure(
            [],
            require => {
                record(require('ophan/embed'));
            },
            'ophan-embed'
        );
    } else {
        record(ophan);
    }
};

const initOphanTracking = (player: Object, mediaId: string) => {
    EVENTS.concat(QUARTILES.map(q => `content:${q}`)).forEach(eventId => {
        player.one(constructEventName(eventId, player), event => {
            ophanRecord(mediaId, event, player);
        });
    });
};

const bindContentEvents = (player: Object) => {
    const events = {
        end() {
            player.trigger(constructEventName('content:end', player));
        },
        play() {
            const duration = player.duration();
            if (duration) {
                player.trigger(constructEventName('content:play', player));
            } else {
                player.one('durationchange', events.play);
            }
        },
        timeupdate() {
            const progress = Math.round(
                parseInt(player.currentTime() / player.duration() * 100, 10)
            );
            QUARTILES.reverse().some(quart => {
                if (progress >= quart) {
                    player.trigger(
                        constructEventName(`content:${quart}`, player)
                    );
                    return true;
                }
                return false;
            });
        },
        ready() {
            player.trigger(constructEventName('content:ready', player));

            player.one('play', events.play);
            player.on('timeupdate', throttle(events.timeupdate, 1000));
            player.one('ended', events.end);

            if (shouldAutoPlay(player)) {
                player.play();
            }
        },
    };
    events.ready();
};

const bindPrerollEvents = (player: Object) => {
    const events = {
        end() {
            player.trigger(constructEventName('preroll:end', player));
            bindContentEvents(player, true);
        },
        start() {
            const duration = player.duration();
            if (duration) {
                player.trigger(constructEventName('preroll:play', player));
            } else {
                player.one('durationchange', events.start);
            }
        },
        ready() {
            player.trigger(constructEventName('preroll:ready', player));

            player.one('adstart', events.start);
            player.one('adend', events.end);

            if (shouldAutoPlay(player)) {
                player.play();
            }
        },
    };
    const adFailed = () => {
        bindContentEvents(player);
        if (shouldAutoPlay(player)) {
            player.play();
        }
        // Remove both handlers, because this adFailed handler should only happen once.
        player.off('adtimeout', adFailed);
        player.off('adserror', adFailed);
    };

    player.one('adsready', events.ready);

    // If no preroll avaliable or preroll fails, cancel ad framework and init content tracking.
    player.one('adtimeout', adFailed);
    player.one('adserror', adFailed);
};

const kruxTracking = (player: Object, event: string) => {
    const desiredVideos = [
        'gu-video-457263940',
        'gu-video-55e4835ae4b00856194f85c2',
    ];
    // test videos /artanddesign/video/2015/jun/25/damien-hirst-paintings-john-hoyland-newport-street-gallery-london-video
    // /music/video/2015/aug/31/vmas-2015-highlights-video

    if (
        config.switches.kruxVideoTracking &&
        config.switches.krux &&
        $(player.el()).attr('data-media-id') &&
        desiredVideos.indexOf($(player.el()).attr('data-media-id')) !== -1
    ) {
        if (event === 'videoPlaying') {
            // Krux is a global object loaded by krux.js file

            /*eslint-disable */
            Krux('admEvent', 'KAIQvckS', {});
            /*eslint-enable */
        } else if (event === 'videoEnded') {
            /*eslint-disable */
            Krux('admEvent', 'KBaTegd5', {});
            /*eslint-enable */
        }
    }
};

// These events are so that other libraries (e.g. Ophan) can hook into events without
// needing to know about videojs
const bindGlobalEvents = (player: Object) => {
    player.on('playing', () => {
        kruxTracking(player, 'videoPlaying');
        bean.fire(document.body, 'videoPlaying');
    });
    player.on('pause', () => {
        bean.fire(document.body, 'videoPause');
    });
    player.on('ended', () => {
        bean.fire(document.body, 'videoEnded');
        kruxTracking(player, 'videoEnded');
    });
};

const beaconError = err => {
    if (err && 'message' in err && 'code' in err) {
        reportError(
            new Error(err.message),
            {
                feature: 'player',
                vjsCode: err.code,
            },
            false
        );
    }
};

const handleInitialMediaError = (player: Object) => {
    const err = player.error();
    if (err !== null) {
        beaconError(err);
        return err.code === 4;
    }
    return false;
};

const bindErrorHandler = (player: Object) => {
    player.on('error', () => {
        beaconError(player.error());
        $('.vjs-big-play-button').hide();
    });
};

export default {
    constructEventName,
    bindContentEvents,
    bindPrerollEvents,
    bindGlobalEvents,
    initOphanTracking,
    handleInitialMediaError,
    bindErrorHandler,
    addContentEvents,
    addPrerollEvents,
    bindGoogleAnalyticsEvents,
};
