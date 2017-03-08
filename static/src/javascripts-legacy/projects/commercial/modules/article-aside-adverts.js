define([
    'Promise',
    'lib/$',
    'lib/$css',
    'lib/config',
    'lib/mediator',
    'lib/fastdom-promise',
    'commercial/modules/dfp/create-slot',
    'commercial/modules/commercial-features'
], function (
    Promise,
    $,
    $css,
    config,
    mediator,
    fastdom,
    createSlot,
    commercialFeatures
) {
    var minArticleHeight = 1300;
    var minFootballArticleHeight = 2200;
    var minImmersiveArticleHeight = 600;

    var mainColumnSelector = '.js-content-main-column';
    var rhColumnSelector = '.js-secondary-column';
    var adSlotContainerSelector = '.js-ad-slot-container';

    function init(start, stop) {
        start();

        var $col        = $(rhColumnSelector);
        var $mainCol, $adSlotContainer;

        // are article aside ads disabled, or secondary column hidden?
        if (!(commercialFeatures.articleAsideAdverts && $col.length && $css($col, 'display') !== 'none')) {
            stop();
            return Promise.resolve(false);
        }

        $mainCol = $(mainColumnSelector);
        $adSlotContainer = $(adSlotContainerSelector);

        fastdom.read(function () {
            return $mainCol.dim().height;
        })
        .then(function (mainColHeight) {
            var $adSlot, adType;


            if (config.page.isImmersive) {
                adType = mainColHeight >= minImmersiveArticleHeight ?
                        'right' :
                        'right-small';
            } else {
                adType = (config.page.section !== 'football' && mainColHeight >= minArticleHeight) ||
                         (config.page.section === 'football' && mainColHeight >= minFootballArticleHeight)
                         ? 'right-sticky' : 'right-small';
            }

            $adSlot = createSlot(adType, { classes: 'mpu-banner-ad' });

            return fastdom.write(function () {
                $adSlotContainer.append($adSlot);
                return $adSlotContainer;
            });
        })
        .then(function ($adSlotContainer) {
            stop();
            mediator.emit('page:commercial:right', $adSlotContainer);
        });

        return Promise.resolve(true);
    }

    return {
        init: init
    };
});
