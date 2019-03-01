// @flow strict
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { bonzo } from 'bonzo';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { addSlot } from 'commercial/modules/dfp/add-slot';

const minArticleHeight: number = 1300;

const calculateImmersiveSizes = (availableSpace: number): string => {
    if (availableSpace > 600) {
        return '1,1|2,2|300,250|300,274|300,600|fluid';
    } else if (availableSpace > 274) {
        return '1,1|2,2|300,250|300,274';
    } else if (availableSpace > 250) {
        return '1,1|2,2|300,250';
    }
    return '1,1|2,2';
};

const createSlotWrapper = (): Element => {
    const adSlotWrapper = document.createElement('div');
    adSlotWrapper.className = 'aside-slot-container js-aside-slot-container';
    adSlotWrapper.setAttribute('aria-hidden', 'true');
    return adSlotWrapper;
};

export const init = (start: () => void, stop: () => void): Promise<boolean> => {
    start();

    const $col: bonzo = $('.js-secondary-column');
    const $mainCol: bonzo = $('.js-content-main-column');
    const $adSlot: bonzo = $('.js-ad-slot', $col);
    const $immersiveEls: bonzo = $('.element--immersive', $mainCol);

    // article aside ads are added server-side UNLESS the page has a ShowcaseMainElement!
    if (!$col.length || $col.css('display') === 'none') {
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
            if (config.get('page.hasShowcaseMainElement', false)) {
                const slotWrapper = createSlotWrapper();
                const asideSlots = createSlots('right-with-showcase', {
                    classes: 'mpu-banner-ad',
                });

                asideSlots.forEach(adSlot => {
                    slotWrapper.append(adSlot);
                });
                return fastdom
                    .write(() => {
                        $col.prepend(slotWrapper);
                    })
                    .then(() => {
                        addSlot(asideSlots[0], false);
                        return asideSlots[0];
                    });
            }
            if (config.get('page.isImmersive') && $immersiveEls.length > 0) {
                // filter ad slot sizes based on the available height
                return fastdom.write(() => {
                    $adSlot.removeClass('right-sticky js-sticky-mpu is-sticky');
                    $adSlot[0].setAttribute(
                        'data-mobile',
                        calculateImmersiveSizes(immersiveOffset)
                    );
                    return $adSlot[0];
                });
                // remove sticky
            }
            if (mainColHeight < minArticleHeight) {
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
            // this is only used for testing...
            mediator.emit('page:defaultcommercial:right', adSlot);
            return true;
        });
};
