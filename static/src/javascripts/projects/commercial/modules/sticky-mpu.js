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
let rightSlot: HTMLElement;

const onResize = (specs, _, iframe: ?HTMLElement) => {
    if (rightSlot.contains(iframe)) {
        unregister('resize', onResize);
        stickyElement.updatePosition();
    }
};

const stickyCommentsAd = (adSlot: HTMLElement) => {
    const dataName = adSlot.dataset.name;
    if (dataName !== 'comments') {
        return;
    }

    stickySlot = adSlot;

    const referenceElement: any = document.querySelector('.js-comments');

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
            mediator.emit('page:commercial:sticky-mpu');
        });
};

const stickyMpu = (adSlot: HTMLElement) => {
    const dataName = adSlot.dataset.name;
    if (dataName !== 'right') {
        return;
    }

    rightSlot = adSlot;

    const referenceElement: any = document.querySelector(
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
                const options = config.page.isPaidContent
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

export { stickyMpu, stickyCommentsAd };
