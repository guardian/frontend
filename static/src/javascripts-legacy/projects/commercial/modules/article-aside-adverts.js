define([
    'Promise',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features',
    'commercial/modules/dfp/performance-logging'
], function (
    Promise,
    $,
    $css,
    config,
    fastdom,
    createSlot,
    commercialFeatures,
    performanceLogging
) {
    var minArticleHeight = 1300;
    var minFootballArticleHeight = 2200;
    var minImmersiveArticleHeight = 600;

    var mainColumnSelector = '.js-content-main-column';
    var rhColumnSelector = '.js-secondary-column';
    var adSlotContainerSelector = '.js-ad-slot-container';
    var componentsContainerSelector = '.js-components-container';

    function init(moduleName) {
        var $col        = $(rhColumnSelector);
        var $mainCol, $componentsContainer, $adSlotContainer;

        // are article aside ads disabled, or secondary column hidden?
        if (!(commercialFeatures.articleAsideAdverts && $col.length && $css($col, 'display') !== 'none')) {
            return Promise.resolve(false);
        }

        performanceLogging.moduleStart(moduleName);

        $mainCol = $(mainColumnSelector);
        $componentsContainer = $(componentsContainerSelector, $col[0]);
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

            $adSlot = createSlot(adType, 'mpu-banner-ad');

            return fastdom.write(function () {
                if (config.page.contentType === 'Article' && config.page.sponsorshipType === 'advertisement-features') {
                    $componentsContainer.addClass('u-h');
                }

                $adSlotContainer.append($adSlot);

                return $adSlotContainer;
            });
        })
        .then(performanceLogging.moduleEnd.bind(null, moduleName));

        return Promise.resolve();
    }

    return {
        init: init
    };
});
