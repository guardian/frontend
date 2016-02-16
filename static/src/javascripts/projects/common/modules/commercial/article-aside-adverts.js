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
    var MIN_ARTICLE_HEIGHT = 1300;
    var MIN_FOOTBALL_ARTICLE_HEIGHT = 2200;
    var MIN_IMMERSIVE_ARTICLE_HEIGHT = 600;

    var mainColumnSelector = '.js-content-main-column';
    var rhColumnSelector = '.js-secondary-column';
    var adSlotContainerSelector = '.js-ad-slot-container';
    var componentsContainerSelector = '.js-components-container';

    function init() {
        var $col        = $(rhColumnSelector);
        var colIsHidden = $col.length && $css($col, 'display') === 'none';
        var $mainCol, $componentsContainer, $adSlotContainer;

        // are article aside ads disabled, or secondary column hidden?
        if (!commercialFeatures.articleAsideAdverts || colIsHidden) {
            return false;
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
                (config.page.section !== 'football' && mainColHeight >= MIN_ARTICLE_HEIGHT) ||
                (config.page.section === 'football' && mainColHeight >= MIN_FOOTBALL_ARTICLE_HEIGHT)
            ) ?
                'right-sticky' :
            mainColHeight >= MIN_IMMERSIVE_ARTICLE_HEIGHT ?
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
