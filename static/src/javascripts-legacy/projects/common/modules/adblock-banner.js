define([
    'fastdom',
    'lib/$',
    'lodash/utilities/template',
    'raw-loader!common/views/commercial/adblock-sticky-message.html',
    'raw-loader!common/views/commercial/adblock-sticky-message-coin.html'
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

    AdblockBanner.prototype.renderTemplate = function () {
        return template(this.templates[this.template], this.config);
    };

    AdblockBanner.prototype.show = function () {
        var bannerTmpl = this.renderTemplate();

        fastdom.write(function () {
            $('.js-top-banner').after(bannerTmpl);
        });
    };

    return AdblockBanner;
});
