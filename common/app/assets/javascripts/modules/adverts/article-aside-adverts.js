define([
    'common/$',
    'common/utils/detect',
    'lodash/objects/assign',
    'common/modules/adverts/dfp'
], function (
    $,
    detect,
    _assign,
    dfp
) {

    function ArticleAsideAdverts(config) {
        this.config = _assign(this.defaultConfig, config);
    }

    ArticleAsideAdverts.prototype.defaultConfig = {
        columnSelector: '.article__secondary-column',
        adSlotContainerSelector: '.js-mpu-ad-slot',
        switches: {}
    };

    ArticleAsideAdverts.prototype.init = function() {
        // is the switch off, or is the secondary column hidden
        if (!this.config.switches.standardAdverts || $(this.config.columnSelector).css('display') === 'none') {
            return false;
        }

        return $(this.config.adSlotContainerSelector)
            .append(dfp.createAdSlot('right', 'mpu-banner-ad'));
    };

    return ArticleAsideAdverts;

});
