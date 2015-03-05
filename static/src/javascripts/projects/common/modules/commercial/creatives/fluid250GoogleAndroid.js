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
        var ad = $.create(template(fluid250GoogleAndroidTpl, this.params));

        fastdom.write(function () {
            ad.appendTo(this.$adSlot);
        }.bind(this));

        if (this.params.trackingPixel) {
            fastdom.write(function () {
                this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster +
                    '" class="creative__tracking-pixel" height="1px" width="1px"/>');
            }.bind(this));
        }
    };

    return Fluid250GoogleAndroid;
});
