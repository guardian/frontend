define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/adblock-sticky-message.html'
], function (
    $,
    _,
    template,
    svgs,
    adblockStickyMessage
) {

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
    };

    AdblockBanner.prototype.show = function () {
        var bannerTmpl = template(adblockStickyMessage,
            {
                supporterLink: this.supporterLink,
                quoteText: this.quoteText,
                quoteAuthor: this.quoteAuthor,
                messageText: this.messageText,
                linkText: this.linkText,
                cursor: svgs('cursor'),
                marque54icon: svgs('marque54icon')
            });

        $('.top-banner-ad-container--desktop').after(bannerTmpl);
    };

    return AdblockBanner;
});
