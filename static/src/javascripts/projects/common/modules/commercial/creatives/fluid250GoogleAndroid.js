define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250GoogleAndroid.html'
], function (
    bean,
    bonzo,
    $,
    mediator,
    storage,
    template,
    fluid250GoogleAndroidTpl
) {
    var Fluid250GoogleAndroid = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;

        if (typeof fluid250GoogleAndroidTpl === 'string') {
            fluid250GoogleAndroidTpl = template(fluid250GoogleAndroidTpl);
        }
    };

    Fluid250GoogleAndroid.prototype.create = function () {

        $.create(fluid250GoogleAndroidTpl(this.params)).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }
    };

    return Fluid250GoogleAndroid;

});
