define([
    'Promise',
    'lib/$',
    'lib/$css',
    'lib/config',
    'lib/mediator',
    'lib/fastdom-promise',
    'commercial/modules/dfp/add-slot',
    'commercial/modules/dfp/create-slot',
    'commercial/modules/commercial-features'
], function (
    Promise,
    $,
    $css,
    config,
    mediator,
    fastdom,
    addSlot,
    createSlot,
    commercialFeatures
) {
    var minArticleHeight = 1300;
    var minImmersiveArticleHeight = 600;

    function init(start, stop) {
        start();

        var $col = $('.js-secondary-column');
        var $mainCol;

        // are article aside ads disabled, or secondary column hidden?
        if (!(commercialFeatures.articleAsideAdverts && $col.length && $css($col, 'display') !== 'none')) {
            stop();
            return Promise.resolve(false);
        }

        $mainCol = $('.js-content-main-column');

        fastdom.read(function () {
            return $mainCol.dim().height;
        })
        .then(function (mainColHeight) {
            var adSlot, adType;
            var $adSlotContainer = $('.js-ad-slot-container', $col[0]);

            if (config.page.isImmersive) {
                adType = mainColHeight >= minImmersiveArticleHeight ?
                        'right' :
                        'right-small';
            } else {
                adType = mainColHeight >= minArticleHeight ?
                    'right-sticky' :
                    'right-small';
            }

            adSlot = createSlot(adType, { classes: 'mpu-banner-ad' });

            return fastdom.write(function () {
                $adSlotContainer.append(adSlot);
                return adSlot;
            });
        })
        .then(function (adSlot) {
            addSlot(adSlot);
            stop();
            mediator.emit('page:commercial:right', adSlot);
        });

        return Promise.resolve(true);
    }

    return {
        init: init
    };
});
