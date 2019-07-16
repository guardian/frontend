// @flow strict
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { bonzo } from 'bonzo';

const minArticleHeight: number = 1300;

const getAllowedSizesForImmersive = (availableSpace: number): string => {
    // filter ad slot sizes based on the available height
    if (availableSpace > 600) {
        return '1,1|2,2|300,250|300,274|300,600|fluid';
    } else if (availableSpace > 274) {
        return '1,1|2,2|300,250|300,274';
    } else if (availableSpace > 250) {
        return '1,1|2,2|300,250';
    }
    return '1,1|2,2';
};

export const init = (): Promise<boolean> => {
    const $col: bonzo = $('.js-secondary-column');

    // article aside ads are added server-side if the container doesn't exist then stop.
    if (!$col.length || $col.css('display') === 'none') {
        return Promise.resolve(false);
    }

    const $mainCol: bonzo = $('.js-content-main-column');
    const $adSlot: bonzo = $('.js-ad-slot', $col);
    const $immersiveEls: bonzo = $('.element--immersive', $mainCol);

    if (!$adSlot.length || !$mainCol.length) {
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
            // we do all the adjustments server-side if the page has a ShowcaseMainElement!
            if (config.get('page.hasShowcaseMainElement', false)) {
                return $adSlot[0];
            }
            // immersive articles may have an image that overlaps the aside ad so we need to remove
            // the sticky behaviour and conditionally adjust the slot size depending on how far down
            // the page the first immersive image appears.
            if (config.get('page.isImmersive') && $immersiveEls.length > 0) {
                return fastdom.write(() => {
                    $adSlot.removeClass('right-sticky js-sticky-mpu is-sticky');
                    $adSlot[0].setAttribute(
                        'data-mobile',
                        getAllowedSizesForImmersive(immersiveOffset)
                    );
                    return $adSlot[0];
                });
            }
            // most articles are long enough to fit a DMPU. However, the occasional shorter article
            // will need the slot sizes to be adjusted, and the sticky behaviour removed.
            if (mainColHeight < minArticleHeight) {
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
            mediator.emit('page:defaultcommercial:right', adSlot);
            return true;
        });
};
