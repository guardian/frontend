define([
    'common/$',
    'common/utils/detect',
    'lodash/objects/assign'
], function (
    $,
    detect,
    _assign
) {

    var adSlotTemplate =
        '<div class="ad-slot ad-slot--dfp ad-slot--mpu-banner-ad" data-link-name="ad slot right" data-name="right" data-tabletlandscape="300,250|300,600">' +
            '<div id="dfp-ad--right" class="ad-slot__container">' +
        '</div>';

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
            .append(adSlotTemplate);
    };

    return ArticleAsideAdverts;

});
