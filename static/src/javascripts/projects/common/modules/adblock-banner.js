define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'text!common/views/commercial/adblock-sticky-message.html',
    'text!common/views/commercial/adblock-influence-banner.html'
], function (
    fastdom,
    $,
    template,
    adblockStickyMessage,
    adblockInfluenceBanner) {

    /**
     * Message which is shown at the top of the page to the adblock users.
     * @constructor
     */
    var AdblockBanner = function (template, config) {
        this.template = template;
        this.config = config;

        this.templates = {
            'adblock-sticky-message': adblockStickyMessage,
            'adblock-influence-banner': adblockInfluenceBanner
        };
    };

    AdblockBanner.prototype.renderTemplate = function () {
        return template(this.templates[this.template], this.config);
    };

    AdblockBanner.prototype.show = function () {
        var bannerTmpl = this.renderTemplate();

        fastdom.write(function () {
            $('.top-banner-ad-container--desktop').after(bannerTmpl);
        });
    };

    return AdblockBanner;
});
