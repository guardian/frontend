import bean from 'bean';
import { mediator } from 'lib/mediator';
import reportError from 'lib/report-error';
import $ from 'lib/$';
import config from 'lib/config';
import { isBreakpoint } from 'lib/detect';
import { isRevisit } from 'common/modules/onward/history';
import throttle from 'lodash/throttle';
import forOwn from 'lodash/forOwn';
import {
    buildGoogleAnalyticsEvent,
    getGoogleAnalyticsEventAction,
} from 'common/modules/video/ga-helper';
import ophan from 'ophan/ng';

const isDesktop = isBreakpoint({
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
const gaTracker = config.get('googleAnalytics.trackers.editorial');

const bindCustomMediaEvents = (
    eventsMap,
    player,
    mediaId,
    mediaType,
    isPreroll
) => {
    forOwn(eventsMap, (value, key) => {
        const fullEventName = `media:${value}`;
        const mediaEvent = {
            mediaId,
            mediaType,
            eventType: value,
            isPreroll,
        };

        player.one(key, () => {
            player.trigger(fullEventName, mediaEvent);
            mediator.emit(fullEventName, mediaEvent);
        });
    });
};

const addContentEvents = (
    player,
    mediaId,
    mediaType
) => {
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
                (player.currentTime() / player.duration()) * 100
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

const bindGoogleAnalyticsEvents = (player, canonicalUrl) => {
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
                    buildGoogleAnalyticsEvent(
                        mediaEvent,
                        events,
                        canonicalUrl,
                        'guardian-videojs',
                        getGoogleAnalyticsEventAction,
                        mediaEvent.mediaId
                    )
                );
            });
        });
};

const getMediaType = player => (isEmbed ? 'video' : player.guMediaType);

const shouldAutoPlay = player =>
    isDesktop && !isRevisit(config.get('page.pageId')) && player.guAutoplay;

const constructEventName = (eventName, player) =>
    `${getMediaType(player)}:${eventName}`;

const ophanRecord = (id, event, player) => {
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

const initOphanTracking = (player, mediaId) => {
    EVENTS.concat(QUARTILES.map(q => `content:${q}`)).forEach(eventId => {
        player.one(constructEventName(eventId, player), event => {
            ophanRecord(mediaId, event, player);
        });
    });
};

const bindContentEvents = (player) => {
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
                parseInt((player.currentTime() / player.duration()) * 100, 10)
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

// These events are so that other libraries (e.g. Ophan) can hook into events without
// needing to know about videojs
const bindGlobalEvents = (player) => {
    player.on('playing', () => {
        bean.fire(document.body, 'videoPlaying');
    });
    player.on('pause', () => {
        bean.fire(document.body, 'videoPause');
    });
    player.on('ended', () => {
        bean.fire(document.body, 'videoEnded');
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

const handleInitialMediaError = (player) => {
    const err = player.error();
    if (err !== null) {
        beaconError(err);
        return err.code === 4;
    }
    return false;
};

const bindErrorHandler = (player) => {
    player.on('error', () => {
        beaconError(player.error());
        $('.vjs-big-play-button').hide();
    });
};

export default {
    constructEventName,
    bindContentEvents,
    bindGlobalEvents,
    initOphanTracking,
    handleInitialMediaError,
    bindErrorHandler,
    addContentEvents,
    bindGoogleAnalyticsEvents,
};
