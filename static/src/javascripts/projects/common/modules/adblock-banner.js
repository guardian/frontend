define([
    'fastdom',
    'common/utils/$',
    'tpl!common/views/commercial/adblock-sticky-message.html',
    'tpl!common/views/commercial/adblock-sticky-message-coin.html'
], function (
    fastdom,
    $,
    adblockStickyMessage,
    adblockStickyMessageCoin) {

    var templates = {
        'adblock-sticky-message': adblockStickyMessage,
        'adblock-sticky-message-coin': adblockStickyMessageCoin
    };

    /**
     * Message which is shown at the top of the page to the adblock users.
     * @constructor
     */
    var AdblockBanner = function (template, config) {
        this.template = templates[template];
        this.config = config;
    };

    AdblockBanner.prototype.renderTemplate = function () {
        return this.template(this.config);
    };

    AdblockBanner.prototype.show = function () {
        var bannerTmpl = this.renderTemplate();

        fastdom.write(function () {
            $('.top-banner-ad-container--desktop').after(bannerTmpl);
        });
    };

    return AdblockBanner;
});
