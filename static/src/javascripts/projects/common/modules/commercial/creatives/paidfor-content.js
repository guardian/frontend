define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/creatives/paidfor-content.html'
], function (
    fastdom,
    $,
    template,
    svgs,
    paidforTpl
) {

    paidforTpl = template(paidforTpl);

    var PaidforContent = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };

    PaidforContent.prototype.create = function () {
        var $component;

        this.params.icon = svgs('arrowdownicon');
        this.params.infoLinkIcon = svgs('arrowRight');

        $component = $.create(paidforTpl(this.params));

        fastdom.write(function () {
            $component.appendTo(this.$adSlot);

            if (this.params.trackingPixel) {
                this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
            }
        }, this);
    };

    return PaidforContent;

});
