define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'text!common/views/commercial/adblock-sticky-message.html',
    'text!common/views/commercial/adblock-sticky-message-coin.html'
], function (
    fastdom,
    $,
    template,
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

    AdblockBanner.prototype.show = function () {
        var bannerTmpl = template(this.templates[this.template], this.config);

        fastdom.write(function () {
            $('.top-banner-ad-container--desktop').after(bannerTmpl);
        });
    };

    return AdblockBanner;
});
