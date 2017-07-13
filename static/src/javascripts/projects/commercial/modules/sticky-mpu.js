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

const stickyMpu = (adSlot: HTMLElement) => {
    if (adSlot.getAttribute('data-name') !== 'right') {
        return;
    }

    rightSlot = adSlot;

    const referenceElement: any = document.querySelector(
        config.page.hasShowcaseMainElement
            ? '.media-primary'
            : '.content__article-body,.js-liveblog-body-content'
    );
    if (!referenceElement || !adSlot) {
        return;
    }

    fastdom
        .read(
            () =>
                referenceElement[
                    config.page.hasShowcaseMainElement
                        ? 'offsetHeight'
                        : 'offsetTop'
                ] + adSlot.offsetHeight
        )
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

export { stickyMpu };
