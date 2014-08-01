define([
    'lodash/objects/defaults',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/config',
    'common/modules/commercial/dfp'
], function (
    defaults,
    once,
    $,
    globalConfig,
    dfp
) {

    function init(c) {
        var config = defaults(
            c || {},
            globalConfig,
            {
                columnSelector: '.content__secondary-column',
                adSlotContainerSelector: '.js-mpu-ad-slot',
                switches: {},
                page: {}
            }
        );

        // is the switch off, or not an article, or the secondary column hidden
        if (
            !config.switches.standardAdverts ||
            !/Article|LiveBlog/.test(config.page.contentType) ||
            $(config.columnSelector).css('display') === 'none'
        ) {
            return false;
        }

        return $(config.adSlotContainerSelector)
            .append(dfp.createAdSlot('right', 'mpu-banner-ad'));
    }

    return {

        init: once(init),

        // for testing
        reset: function() {
            this.init = once(init);
        }

    };

});
