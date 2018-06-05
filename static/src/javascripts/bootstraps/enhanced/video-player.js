import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import raven from 'lib/raven';
import { buildGoogleAnalyticsEvent, getGoogleAnalyticsEventAction } from 'common/modules/video/ga-helper';
import config from 'lib/config';

const gaTracker = config.get('googleAnalytics.trackers.editorial');

const getCanonicalUrl = (dataset: Object): string =>
    dataset.canonicalUrl ||
    // we need to look up the embedPath for main media videos
    dataset.embedPath ||
    // the fallback to window.location.pathname should only happen for main media on fronts
    window.location.pathname;

const enhanceVideo = (
    el: HTMLMediaElement,
): void => {
    const mediaType = el.tagName.toLowerCase();
    const dataset = el.dataset;
    const { mediaId } = dataset;
    const canonicalUrl = getCanonicalUrl(dataset);

    const playHandler = () => {
        // on play, fire GA event (ensure replays also fire event)
        const mediaEvent = {
            mediaId,
            mediaType,
            eventType: 'play',
            isPreroll: false
        };
        const events = {
            play: 'metric1',
        };

        window.ga(
            `${gaTracker}.send`,
            'event',
            buildGoogleAnalyticsEvent(
                mediaEvent,
                events,
                canonicalUrl,
                'guardian-videojs',
                getGoogleAnalyticsEventAction,
                mediaId
            )
        );

        // on play, fire Ophan event (ensure replays also fire event)

        // don't fire events every time video is paused then restarted
        el.removeEventListener('play', playHandler);
    };

    el.addEventListener('play', playHandler);
    el.addEventListener('ended', () => {
        // track re-plays
        el.addEventListener('play', playHandler);
    });

    // hide download button in Chrome
    el.setAttribute('controlsList', 'nodownload');
};

const initPlayer = (): void => {
    fastdom.read(() => {
        $('.js-gu-media--enhance').each(el => {
            enhanceVideo(el, false);
        });
    });
};

const initWithRaven = (): void => {
    raven.wrap(
        {
            tags: {
                feature: 'video',
            },
        },
        () => {
            initPlayer();
        }
    )();
};

export const initVideoPlayer = (): void => {
    initWithRaven();
};
