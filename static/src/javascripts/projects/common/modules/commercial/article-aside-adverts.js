define([
    'lodash/objects/defaults',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/config',
    'common/modules/commercial/create-ad-slot'
], function (
    defaults,
    $,
    $css,
    config,
    createAdSlot
) {

    function init(options) {
        var $mainCol, adType,
            opts        = defaults(
                options || {},
                {
                    columnSelector: '.js-secondary-column',
                    adSlotContainerSelector: '.js-mpu-ad-slot'
                }
            ),
            $col        = $(opts.columnSelector),
            colIsHidden = $col.length && $css($col, 'display') === 'none';

        // is the switch off, or not an article, or the secondary column hidden
        if (!config.switches.standardAdverts || !/Article|LiveBlog/.test(config.page.contentType) || colIsHidden) {
            return false;
        }

        $mainCol = config.page.contentType === 'Article' ? $('.js-content-main-column') : false;
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

        if (config.page.contentType === 'Article' && config.page.sponsorshipType === 'advertisement-features') {
            $('.js-components-container', '.js-secondary-column').addClass('u-h');
        }

        return $(opts.adSlotContainerSelector)
            .append(createAdSlot(adType, 'mpu-banner-ad'));
    }

    return {

        init: init

    };

});
