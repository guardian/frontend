define([
    'bean',
    'bonzo',
    'lodash/objects/merge',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250.html'
], function (
    bean,
    bonzo,
    merge,
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
        var templateOptions = {
            showLabel: (this.params.showAdLabel === 'hide') ?
            'creative__label--hidden' : ''
        };
        $.create(template(fluid250Tpl, merge(this.params, templateOptions))).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }
        this.$adSlot.addClass('ad-slot__fluid250');
    };

    return Fluid250;

});
