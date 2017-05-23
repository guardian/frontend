// @flow
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { commercialFeatures } from 'commercial/modules/commercial-features';

import type { bonzo } from 'bonzo';

const minArticleHeight: number = 1300;
const minImmersiveArticleHeight: number = 600;

const minContentHeight = (): number =>
    config.page.isImmersive ? minImmersiveArticleHeight : minArticleHeight;

const articleAsideAdvertsInit = (
    start: () => void,
    stop: () => void
): Promise<boolean> => {
    start();

    const $col: bonzo = $('.js-secondary-column');

    // are article aside ads disabled, or secondary column hidden?
    if (
        !(commercialFeatures.articleAsideAdverts &&
            $col.length &&
            $col.css('display') !== 'none')
    ) {
        stop();
        return Promise.resolve(false);
    }

    const $mainCol: bonzo = $('.js-content-main-column');
    const $adSlot: bonzo = $('.js-ad-slot', $col);

    if (!$adSlot.length || !$mainCol.length) {
        stop();
        return Promise.resolve(false);
    }

    return fastdom
        .read((): number => $mainCol.dim().height)
        .then((mainColHeight: number) => {
            // Should switch to 'right-small' MPU for short articles
            if (mainColHeight < minContentHeight()) {
                return fastdom.write(() => {
                    $adSlot.removeClass('right-sticky js-sticky-mpu is-sticky');
                    $adSlot[0].setAttribute(
                        'data-mobile',
                        '1,1|2,2|300,250|fluid'
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

export { articleAsideAdvertsInit };
