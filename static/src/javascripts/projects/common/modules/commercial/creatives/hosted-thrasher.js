define([
    'common/utils/fastdom-promise',
    'common/utils/template',
    'common/modules/commercial/hosted-video',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/hosted-thrasher.html'
], function (
    fastdom,
    template,
    hostedVideo,
    addTrackingPixel,
    hostedThrasherStr
) {
    var hostedThrasherTemplate;

    var HostedThrasher = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    HostedThrasher.prototype.create = function () {
        hostedThrasherTemplate = hostedThrasherTemplate || template(hostedThrasherStr);

        fastdom.write(function () {
            this.$adSlot.append(hostedThrasherTemplate({ data: this.params}));
            if (this.params.trackingPixel) {
                addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
            }
        }, this).then(hostedVideo.init);
    };

    return HostedThrasher;

});
