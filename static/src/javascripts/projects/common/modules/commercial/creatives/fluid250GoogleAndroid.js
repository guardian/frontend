define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'template!common/views/commercial/creatives/fluid250GoogleAndroid.html',
    'common/modules/commercial/creatives/add-tracking-pixel'
], function (
    bean,
    bonzo,
    $,
    mediator,
    storage,
    fluid250GoogleAndroidTpl,
    addTrackingPixel
) {
    var Fluid250GoogleAndroid = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    Fluid250GoogleAndroid.prototype.create = function () {

        $.create(fluid250GoogleAndroidTpl(this.params)).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }
    };

    return Fluid250GoogleAndroid;

});
