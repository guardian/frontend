define([
    'fastdom',
    'common/utils/$',
    'common/views/svgs',
    'template!common/views/commercial/adblock-sticky-message.html',
    'template!common/views/commercial/adblock-sticky-message-coin.html'
], function (
    fastdom,
    $,
    svgs,
    adblockStickyMessage,
    adblockStickyMessageCoin) {

    /**
     * Message which is shown at the top of the page to the adblock users.
     *
     * @constructor
     * @param {Object=} options
     */
    var AdblockBanner = function (options) {
        var opts = options || {};

        this.templates = {
            coin: adblockStickyMessageCoin,
            contributor: adblockStickyMessage
        };

        this.supporterLink = opts.supporterLink || '';
        this.template = opts.template || 'contributor';
        this.messageText = opts.messageText || 'Become a supporter from just £5 per month to ensure quality journalism is available to all.';
        this.linkText = opts.linkText || 'Find out more';
        this.quoteText = opts.quoteText || '';
        this.quoteAuthor = opts.quoteAuthor || '';
        this.imageAuthor = opts.imageAuthor || '';
        this.customCssClass = opts.customCssClass || '';
    };

    AdblockBanner.prototype.show = function () {
        var bannerTmpl = this.templates[this.template](
            {
                supporterLink: this.supporterLink,
                quoteText: this.quoteText,
                quoteAuthor: this.quoteAuthor,
                messageText: this.messageText,
                linkText: this.linkText,
                imageAuthor: this.imageAuthor,
                customCssClass: this.customCssClass,
                cursor: svgs('cursor'),
                rectangleLogo: svgs('logomembership'),
                adblockCoins: svgs('adblockCoins'),
                marque54icon: svgs('marque54icon'),
                marque36icon: svgs('marque36icon')
            });

        fastdom.write(function () {
            $('.top-banner-ad-container--desktop').after(bannerTmpl);
        });
    };

    return AdblockBanner;
});
