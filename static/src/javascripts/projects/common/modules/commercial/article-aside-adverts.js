define([
    'qwery',
    'lodash/objects/defaults',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/config',
    'common/modules/commercial/dfp'
], function (
    qwery,
    defaults,
    once,
    $,
    $css,
    globalConfig,
    dfp
) {

    function init(c) {
        var $mainCol, adType,
            config = defaults(
                c || {},
                globalConfig,
                {
                    columnSelector: '.content__secondary-column',
                    adSlotContainerSelector: '.js-mpu-ad-slot',
                    switches: {},
                    page: {}
                }
            ),
            $col = $(config.columnSelector),
            colIsHidden = $col.length && $css($col, 'display') === 'none';

        // is the switch off, or not an article, or the secondary column hidden
        if (!config.switches.standardAdverts || !/Article|LiveBlog/.test(config.page.contentType) || colIsHidden) {
            return false;
        }

        $mainCol = config.page.contentType === 'Article' ? $('.js-content-main-column') : false;
        adType   = !$mainCol.length || $mainCol.dim().height >= 600 ? 'right' : 'right-small';

        return $(config.adSlotContainerSelector)
            .append(dfp.createAdSlot(adType, 'mpu-banner-ad'));
    }

    return {

        init: once(init),

        // for testing
        reset: function () {
            this.init = once(init);
        }

    };

});
