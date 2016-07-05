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
    var minArticleHeight = 1300;
    var minFootballArticleHeight = 2200;
    var minImmersiveArticleHeight = 600;

    var mainColumnSelector = '.js-content-main-column';
    var rhColumnSelector = '.js-secondary-column';
    var adSlotContainerSelector = '.js-ad-slot-container';
    var componentsContainerSelector = '.js-components-container';

    function init() {
        var $col        = $(rhColumnSelector);
        var $mainCol, $componentsContainer, $adSlotContainer;

        // are article aside ads disabled, or secondary column hidden?
        if (!(commercialFeatures.articleAsideAdverts && $col.length && $css($col, 'display') !== 'none')) {
            return Promise.resolve();
        }

        $mainCol = $(mainColumnSelector);
        $componentsContainer = $(componentsContainerSelector, $col[0]);
        $adSlotContainer = $(adSlotContainerSelector);

        return fastdom.read(function () {
            return $mainCol.dim().height;
        }).then(function (mainColHeight) {
            var $adSlot, adType;

            adType = !config.page.isImmersive && (
                !$mainCol.length ||
                (config.page.section !== 'football' && mainColHeight >= minArticleHeight) ||
                (config.page.section === 'football' && mainColHeight >= minFootballArticleHeight)
            ) ?
                'right-sticky' :
            mainColHeight >= minImmersiveArticleHeight ?
                'right' :
                'right-small';

            $adSlot = createAdSlot(adType, 'mpu-banner-ad');

            return fastdom.write(function () {
                if (config.page.contentType === 'Article' && config.page.sponsorshipType === 'advertisement-features') {
                    $componentsContainer.addClass('u-h');
                }

                $adSlotContainer.append($adSlot);

                return $adSlotContainer;
            });
        });
    }

    return {
        init: init
    };
});
