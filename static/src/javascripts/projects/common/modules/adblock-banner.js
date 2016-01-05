define([
    'fastdom',
    'common/utils/$',
    'common/views/svgs',
    'ldsh!common/views/commercial/adblock-sticky-message.html'
], function (
    fastdom,
    $,
    svgs,
    adblockStickyMessage) {

    /**
     * Message which is shown at the top of the page to the adblock users.
     *
     * @constructor
     * @param {Object=} options
     */
    var AdblockBanner = function (options) {
        var opts = options || {};
        this.supporterLink = opts.supporterLink || '';
        this.messageText = opts.messageText || '';
        this.linkText = opts.linkText || '';
        this.quoteText = opts.quoteText || '';
        this.quoteAuthor = opts.quoteAuthor || '';
        this.imageAuthor = opts.imageAuthor || '';
        this.customCssClass = opts.customCssClass || '';
    };

    AdblockBanner.prototype.show = function () {
        var bannerTmpl = adblockStickyMessage(
            {
                supporterLink: this.supporterLink,
                quoteText: this.quoteText,
                quoteAuthor: this.quoteAuthor,
                messageText: 'Become a supporter from just £5 per month to ensure quality journalism is available to all.',
                linkText: 'Find out more',
                imageAuthor: this.imageAuthor,
                customCssClass: this.customCssClass,
                cursor: svgs('cursor'),
                marque54icon: svgs('marque54icon')
            });

        fastdom.write(function () {
            $('.top-banner-ad-container--desktop').after(bannerTmpl);
        });
    };

    return AdblockBanner;
});
