define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/adblock-sticky-message.html',
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
    };

    AdblockBanner.prototype.show = function () {
        template(adblockStickyMessage,
            {
                supporterLink: this.supporterLink,
                messageText: this.messageText,
                linkText: this.linkText,
                arrowWhiteRight: svgs('arrowWhiteRight')
            });
    };

    return AdblockBanner;
});
