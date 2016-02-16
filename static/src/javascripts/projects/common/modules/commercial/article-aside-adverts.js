define([
    'Promise',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features'
], function (
    Promise,
    $,
    $css,
    config,
    fastdom,
    createAdSlot,
    commercialFeatures
) {
    var mainColumnSelector = '.js-content-main-column';
    var rhColumnSelector = '.js-secondary-column';
    var adSlotContainerSelector = '.js-ad-slot-container';
    var componentsContainerSelector = '.js-components-container';

    function init() {
        var $mainCol, adType,
            $col        = $(columnSelector),
            colIsHidden = $col.length && $css($col, 'display') === 'none',
            $componentsContainer,
            $adSlotContainer;

        // are article aside ads disabled, or secondary column hidden?
        if (!commercialFeatures.articleAsideAdverts || colIsHidden) {
            return false;
        }

        $mainCol = config.page.contentType === 'Article' ? $(mainColumnSelector) : false;
        $componentsContainer = $(componentsContainerSelector, $col[0]);
        $adSlotContainer = $(adSlotContainerSelector);

        return new Promise(function (resolve) {
            fastdom.read(function () {
                if (
                    !config.page.isImmersive && (
                    !$mainCol.length ||
                    (config.page.section !== 'football' && $mainCol.dim().height >= 1300) ||
                    (config.page.section === 'football' && $mainCol.dim().height >= 2200))
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
