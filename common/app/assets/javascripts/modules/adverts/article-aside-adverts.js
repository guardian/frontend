define([
    'common/$',
    'common/utils/detect',
    'common/utils/page',
    'lodash/objects/assign'
], function (
    $,
    detect,
    page,
    _assign
) {

    var adSlotTemplate =
        '<div class="ad-slot ad-slot--dfp ad-slot--mpu-banner-ad" data-link-name="ad slot right" data-name="right" data-tabletlandscape="300,250">' +
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
        if (!this.config.switches.standardAdverts) {
            return false;
        }

        return page.rightHandComponentVisible(
            function(rightHandComponent) {
                return $(this.config.adSlotContainerSelector, rightHandComponent)
                    .append(adSlotTemplate);
            }.bind(this)
        );
    };

    return ArticleAsideAdverts;

});
