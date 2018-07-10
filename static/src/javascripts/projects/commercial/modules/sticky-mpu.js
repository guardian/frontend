// @flow
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { Sticky } from 'common/modules/ui/sticky';
import { register, unregister } from 'commercial/modules/messenger';

const noSticky: boolean = !!(
    document.documentElement &&
    document.documentElement.classList.contains('has-no-sticky')
);
let stickyElement: Sticky;
let stickySlot: HTMLElement;

const onResize = (specs, _, iframe: ?HTMLElement) => {
    if (stickySlot.contains(iframe)) {
        unregister('resize', onResize);
        stickyElement.updatePosition();
    }
};

const isStickyMpuSlot = (adSlot: HTMLElement) => {
    const dataName = adSlot.dataset.name;
    return dataName === 'comments' || dataName === 'right';
};

const stickyCommentsMpu = (adSlot: HTMLElement) => {
    if (isStickyMpuSlot(adSlot)) {
        stickySlot = adSlot;
    }

    const referenceElement: ?HTMLElement = document.querySelector(
        '.js-comments'
    );

    if (!referenceElement || !adSlot) {
        return;
    }

    fastdom
        .read(() => referenceElement.offsetHeight - 600)
        .then(newHeight =>
            fastdom.write(() => {
                (adSlot.parentNode: any).style.height = `${newHeight}px`;
            })
        )
        .then(() => {
            if (noSticky) {
                stickyElement = new Sticky(adSlot);
                stickyElement.init();
                register('resize', onResize);
            }
            mediator.emit('page:commercial:sticky-comments-mpu');
        });
};

stickyCommentsMpu.whenRendered = new Promise(resolve => {
    mediator.on('page:commercial:sticky-comments-mpu', resolve);
});

const stickyMpu = (adSlot: HTMLElement) => {
    if (isStickyMpuSlot(adSlot)) {
        stickySlot = adSlot;
    }

    const referenceElement: ?HTMLElement = document.querySelector(
        '.js-article__body,.js-liveblog-body-content'
    );

    const stickyPixelBoundary: number = 300;

    if (
        !referenceElement ||
        !adSlot ||
        config.get('page.hasShowcaseMainElement')
    ) {
        return;
    }

    fastdom
        .read(() => referenceElement.offsetTop + stickyPixelBoundary)
        .then(newHeight =>
            fastdom.write(() => {
                (adSlot.parentNode: any).style.height = `${newHeight}px`;
            })
        )
        .then(() => {
            if (noSticky) {
                // if there is a sticky 'paid by' band move the sticky mpu down so it will be always visible
                const options = config.get('page.isPaidContent')
                    ? {
                          top: 43,
                      }
                    : {};
                stickyElement = new Sticky(adSlot, options);
                stickyElement.init();
                register('resize', onResize);
            }
            mediator.emit('page:commercial:sticky-mpu');
        });
};

stickyMpu.whenRendered = new Promise(resolve => {
    mediator.on('page:commercial:sticky-mpu', resolve);
});

export { stickyMpu, stickyCommentsMpu };
