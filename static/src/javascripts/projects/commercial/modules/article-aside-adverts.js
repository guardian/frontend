// @flow
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { bonzo } from 'bonzo';
import type { AdSize } from 'commercial/types';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { adSizes } from 'commercial/modules/ad-sizes';

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

const createAsideSlots = (availableSpace: ?number): Array<HTMLDivElement> => {
    // TODO: workout available space, so we know which adSizes can be used before we create the slot
    const calculateShowcaseSizes = (
        offset: number
    ): { [string]: Array<AdSize> } => {
        // ??? what is our threshold? Where does inline2 insert?
        if (offset < 700) {
            return { desktop: [adSizes.halfPage] };
        }
        return {};
    };
    return createSlots('right', {
        classes: 'mpu-banner-ad',
        sizes: availableSpace ? calculateShowcaseSizes(availableSpace) : null,
    });
};

export const init = (start: () => void, stop: () => void): Promise<boolean> => {
    start();

    const $col: bonzo = $('.js-secondary-column');
    const $mainCol: bonzo = $('.js-content-main-column');
    const $adSlot: bonzo = $('.js-ad-slot', $col);
    const $immersiveEls: bonzo = $('.element--immersive', $mainCol);

    // article aside ads are added server-side UNLESS the page has a ShowcaseMainElement!
    if (!$mainCol.length || !$col.length || $col.css('display') === 'none') {
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
            // TODO: should we check if shouldShowAds? Ideally the module will not load anyway..
            if (config.get('page.hasShowcaseMainElement', false)) {
                const slotWrapper = createSlotWrapper();
                const asideSlots = createAsideSlots();

                // TODO: can we do something with the $col.style padding to work out if we can fit a DMPU?
                asideSlots.forEach(adSlot => {
                    slotWrapper.append(adSlot);
                });
                return fastdom
                    .write(() => {
                        $col.prepend(slotWrapper);
                    })
                    .then(() => {
                        addSlot(asideSlots[0], false);
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
        .then((adSlot: ?Element) => {
            stop();
            // this is only used for testing...
            mediator.emit('page:defaultcommercial:right', adSlot);
            return true;
        });
};
