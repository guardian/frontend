define([
    'bean',
    'bonzo',
    'Promise',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250GoogleAndroid.html',
    'common/modules/commercial/creatives/add-tracking-pixel'
], function (
    bean,
    bonzo,
    Promise,
    $,
    mediator,
    storage,
    template,
    fluid250GoogleAndroidTpl,
    addTrackingPixel
) {
    var Fluid250GoogleAndroid = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    Fluid250GoogleAndroid.prototype.create = function () {

        $.create(template(fluid250GoogleAndroidTpl, this.params)).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }

        return Promise.resolve(true);
    };

    return Fluid250GoogleAndroid;

});
