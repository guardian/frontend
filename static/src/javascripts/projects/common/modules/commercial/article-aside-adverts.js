define([
    'fastdom',
    'Promise',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/config',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features',
    'lodash/objects/defaults'
], function (
    fastdom,
    Promise,
    $,
    $css,
    config,
    createAdSlot,
    commercialFeatures,
    defaults) {
    function init(options) {
        var $mainCol, adType,
            opts = defaults(
                options || {},
                {
                    columnSelector: '.js-secondary-column',
                    adSlotContainerSelector: '.js-ad-slot-container'
                }
            ),
            $col        = $(opts.columnSelector),
            colIsHidden = $col.length && $css($col, 'display') === 'none',
            $componentsContainer,
            $adSlotContainer;

        // are article aside ads disabled, or secondary column hidden?
        if (!commercialFeatures.articleAsideAdverts || colIsHidden) {
            return false;
        }

        $mainCol = config.page.contentType === 'Article' ? $('.js-content-main-column') : false;
        $componentsContainer = $('.js-components-container', '.js-secondary-column');
        $adSlotContainer = $(opts.adSlotContainerSelector);

        return new Promise(function (resolve) {
            fastdom.read(function () {
                if (
                    !$mainCol.length ||
                    (config.page.section !== 'football' && $mainCol.dim().height >= 1300) ||
                    (config.page.section === 'football' && $mainCol.dim().height >= 2200)
                ) {
                    adType = 'right-sticky';
                } else if ($mainCol.dim().height >= 600) {
                    adType = 'right';
                } else {
                    adType = 'right-small';
                }

                fastdom.write(function () {
                    if (config.page.contentType === 'Article' && config.page.sponsorshipType === 'advertisement-features') {
                        $componentsContainer.addClass('u-h');
                    }

                    $adSlotContainer.append(createAdSlot(adType, 'mpu-banner-ad'));

                    resolve($adSlotContainer);
                });
            });
        });
    }

    return {
        init: init
    };
});
