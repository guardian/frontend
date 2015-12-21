define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/creatives/gu-style-comcontent.html'
], function (
    fastdom,
    $,
    template,
    svgs,
    gustyleComcontentTpl
) {

    gustyleComcontentTpl = template(gustyleComcontentTpl);

    var GustyleComcontent = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };

    GustyleComcontent.prototype.create = function () {
        var $component;

        this.params.metaLabel = 'Paid Content';
        this.params.buttonLabel = 'About';
        this.params.icon = svgs('arrowdownicon');
        this.params.infoTitle = 'Paid stories are paid for and controlled by an advertiser';
        this.params.infoLinkText = 'Learn more about the Guardian’s funding from outside parties';
        this.params.infoLinkUrl = 'https://www.theguardian.com/info/2014/sep/23/paid-for-content';
        this.params.infoLinkIcon = svgs('arrowRight');
        this.params.note = 'Paid for by:';

        $component = $.create(gustyleComcontentTpl(this.params))

        fastdom.write(function() {
            $component.appendTo(this.$adSlot);

            if (this.params.trackingPixel) {
                this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
            }
        }.bind(this));
    };

    return GustyleComcontent;

});
