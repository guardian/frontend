// @flow
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import commercialFeatures from 'commercial/modules/commercial-features';

const minArticleHeight = 1300;
const minImmersiveArticleHeight = 600;

const minContentHeight = () =>
    config.page.isImmersive ? minImmersiveArticleHeight : minArticleHeight;

const init = (start: () => void, stop: () => void) => {
    start();

    const $col = $('.js-secondary-column');

    // are article aside ads disabled, or secondary column hidden?
    if (
        !(commercialFeatures.articleAsideAdverts &&
            $col.length &&
            $col.css('display') !== 'none')
    ) {
        stop();
        return Promise.resolve(false);
    }

    const $mainCol = $('.js-content-main-column');
    const $adSlot = $('.js-ad-slot', $col);

    if (!$adSlot.length || !$mainCol.length) {
        stop();
        return Promise.resolve(false);
    }

    return fastdom
        .read(() => $mainCol.dim().height)
        .then(mainColHeight => {
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
        .then(adSlot => {
            stop();
            mediator.emit('page:commercial:right', adSlot);
        });
};

export default {
    init,
};
