// @flow
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import type { bonzo } from 'bonzo';

const minArticleHeight: number = 1300;

const calculateAllowedAdSlots = (availableSpace: number): string => {
    if (availableSpace > 600) {
        return '1,1|2,2|300,250|300,274|300,600|fluid';
    } else if (availableSpace > 274) {
        return '1,1|2,2|300,250|300,274';
    } else if (availableSpace > 250) {
        return '1,1|2,2|300,250';
    }
    return '1,1|2,2';
};

export const init = (start: () => void, stop: () => void): Promise<boolean> => {
    start();

    const $col: bonzo = $('.js-secondary-column');

    // article aside ads are added server-side if the container doesn't exist then stop.
    if (!$col.length || $col.css('display') === 'none') {
        stop();
        return Promise.resolve(false);
    }

    const $mainCol: bonzo = $('.js-content-main-column');
    const $showcase: bonzo = $('.media-primary--showcase');
    const $adSlot: bonzo = $('.js-ad-slot', $col);
    const $immersiveEls: bonzo = $('.element--immersive', $mainCol);

    if (!$adSlot.length || !$mainCol.length) {
        stop();
        return Promise.resolve(false);
    }

    return fastdom
        .read(
            (): [number, number] => [
                $mainCol.dim().height,
                $immersiveEls.offset().top - $mainCol.offset().top,
            ]
        )
        .then(([mainColHeight, immersiveOffset]: [number, number]) => {
            if (config.get('page.hasShowcaseMainElement')) {
                fastdom
                    .read(() => $showcase.dim().height)
                    .then((showcaseHeight: number) => {
                        if (showcaseHeight >= 650) {
                            return fastdom.write(() => {
                                $adSlot.removeClass(
                                    'right-sticky js-sticky-mpu is-sticky'
                                );
                                $adSlot[0].setAttribute(
                                    'data-mobile',
                                    '1,1|2,2|300,250|300,274|fluid'
                                );
                            });
                        }
                    });
            } else if (
                config.get('page.isImmersive') &&
                $immersiveEls.length > 0
            ) {
                // filter ad slot sizes based on the available height
                return fastdom.write(() => {
                    $adSlot.removeClass('right-sticky js-sticky-mpu is-sticky');
                    $adSlot[0].setAttribute(
                        'data-mobile',
                        calculateAllowedAdSlots(immersiveOffset)
                    );
                    return $adSlot[0];
                });
                // remove sticky
            } else if (mainColHeight < minArticleHeight) {
                // Should switch to 'right-small' MPU for short articles
                return fastdom.write(() => {
                    $adSlot.removeClass('right-sticky js-sticky-mpu is-sticky');
                    $adSlot[0].setAttribute(
                        'data-mobile',
                        '1,1|2,2|300,250|300,274|fluid'
                    );
                    return $adSlot[0];
                });
            }
            return $adSlot[0];
        })
        .then((adSlot: Element) => {
            stop();
            mediator.emit('page:defaultcommercial:right', adSlot);
            return true;
        });
};
