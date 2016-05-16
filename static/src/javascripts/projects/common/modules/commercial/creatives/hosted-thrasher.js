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
    hostedVideoStr
) {
    var hostedVideoTpl;

    var HostedThrasher = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    HostedThrasher.prototype.create = function () {
        if (!hostedVideoTpl) {
            hostedVideoTpl = template(hostedVideoStr);
        }

        var domPromise = fastdom.write(function () {
            this.$adSlot.append(hostedVideoTpl({ data: this.params}));
        }.bind(this));

        domPromise.then(function () {
            hostedVideo.init();
        });

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }
    };

    return HostedThrasher;

});
