// @flow
import ophan from 'ophan/ng';
import config from 'lib/config';
import { buildGoogleAnalyticsEvent } from 'common/modules/video/ga-helper';

const audioSelector = '.gu-media--audio';
const gaTracker = config.get('googleAnalytics.trackers.editorial');
const metricMap = {
    play: 'metric1',
    skip: 'metric2',
    '25': 'metric3',
    '50': 'metric4',
    '75': 'metric5',
    end: 'metric6',
};

// Sends a media event to Ophan
const record = (mediaId: string, eventType: string) => {
    ophan.record({
        audio: {
            id: `gu-audio-${mediaId}`,
            eventType: `audio:content:${eventType}`,
        },
    });
    window.ga(
        `${gaTracker}.send`,
        'event',
        buildGoogleAnalyticsEvent(
            {
                mediaType: 'audio',
                isPreroll: false,
                mediaId,
                eventType,
            },
            metricMap,
            `${eventType}:${mediaId}`,
            'gu-audio',
            () => 'audio content',
            mediaId
        )
    );
};

const True = () => true;

// Determines whether a reader has listened up to pct% of the audio track
const percent = (pct: number) => (event: Event): boolean => {
    const target: HTMLMediaElement = (event.target: any);
    return Math.floor(target.currentTime / target.duration * 100) === pct;
};

// Sends an `eventType` only if `pred(event)`
const recordIf = (pred: Event => boolean, eventType: string) => (
    event: Event
): boolean => {
    if (pred(event)) {
        record(
            ((event.target: any): HTMLElement).getAttribute('data-media-id') ||
                '',
            eventType
        );
        return true;
    }
    return false;
};

const init = (): void => {
    const audios: Element[] = Array.from(
        document.querySelectorAll(audioSelector)
    );
    const events: Array<[string, (Event) => boolean]> = [
        ['canplay', recordIf(True, 'ready')],
        ['playing', recordIf(True, 'play')],
        ['timeupdate', recordIf(percent(25), '25')],
        ['timeupdate', recordIf(percent(50), '50')],
        ['timeupdate', recordIf(percent(75), '75')],
        ['ended', recordIf(True, 'end')],
    ];

    events.forEach(([eventType, action]) => {
        audios.forEach(audio => {
            audio.addEventListener(eventType, function track(event: Event) {
                if (action(event)) {
                    audio.removeEventListener(eventType, track);
                }
            });
        });
    });
};

export { init };
