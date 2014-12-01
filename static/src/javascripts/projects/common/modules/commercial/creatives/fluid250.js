define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250.html'
], function (
    bean,
    bonzo,
    $,
    mediator,
    storage,
    template,
    fluid250Tpl
) {
    var Fluid250 = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    Fluid250.prototype.create = function () {

        $.create(template(fluid250Tpl, this.params)).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }
        this.$adSlot.addClass('ad-slot__fluid250');
    };

    return Fluid250;

});
