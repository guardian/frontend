import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import raven from 'lib/raven';

const enhanceVideo = (
    el: HTMLMediaElement,
): void => {
    // on play, fire GA event (ensure replays also fire event)

    // on play, fire Ophan event (ensure replays also fire event)

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
    console.log('Enhancing video');
    initWithRaven();
};
