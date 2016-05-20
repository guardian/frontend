define([
    'fastdom',
    'common/utils/$',
    'template!common/views/commercial/adblock-sticky-message.html',
    'template!common/views/commercial/adblock-sticky-message-coin.html'
], function (
    fastdom,
    $,
    adblockStickyMessage,
    adblockStickyMessageCoin) {

    /**
     * Message which is shown at the top of the page to the adblock users.
     * @constructor
     */
    var AdblockBanner = function (template, config) {
        this.template = template;
        this.config = config;

        this.templates = {
            'adblock-sticky-message': adblockStickyMessage,
            'adblock-sticky-message-coin': adblockStickyMessageCoin
        };
    };

    AdblockBanner.prototype.renderTemplate = function () {
        return this.templates[this.template](this.config);
    };

    AdblockBanner.prototype.show = function () {
        var bannerTmpl = this.renderTemplate();

        fastdom.write(function () {
            $('.top-banner-ad-container--desktop').after(bannerTmpl);
        });
    };

    return AdblockBanner;
});
