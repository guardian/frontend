define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250GoogleAndroid.html'
], function (
    bean,
    bonzo,
    fastdom,
    $,
    mediator,
    storage,
    template,
    fluid250GoogleAndroidTpl
) {
    var Fluid250GoogleAndroid = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    Fluid250GoogleAndroid.prototype.create = function () {
        var that = this,
            ad = $.create(template(fluid250GoogleAndroidTpl, this.params));

        fastdom.write(function () {
            ad.appendTo(that.$adSlot);
        });

        if (this.params.trackingPixel) {
            fastdom.write(function () {
                that.$adSlot.before('<img src="' + that.params.trackingPixel + that.params.cacheBuster +
                    '" class="creative__tracking-pixel" height="1px" width="1px"/>');
            });
        }
    };

    return Fluid250GoogleAndroid;
});
