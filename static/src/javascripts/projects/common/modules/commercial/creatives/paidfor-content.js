define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/views/svgs',
    'common/modules/ui/toggles',
    'text!common/views/commercial/creatives/paidfor-content.html'
], function (
    fastdom,
    $,
    template,
    svgs,
    Toggles,
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
        this.params.dataAttr = Math.floor(Math.random() * 1000);

        $component = $.create(paidforTpl(this.params));

        fastdom.write(function () {
            $component.appendTo(this.$adSlot);
            new Toggles(this.$adSlot[0]).init();

            if (this.params.trackingPixel) {
                this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
            }
        }, this);
    };

    return PaidforContent;

});
