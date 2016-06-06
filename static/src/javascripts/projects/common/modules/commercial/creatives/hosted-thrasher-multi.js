define([
    'common/utils/fastdom-promise',
    'common/utils/config',
    'common/utils/template',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/hosted-thrasher-multi.html'
], function (
    fastdom,
    config,
    template,
    addTrackingPixel,
    hostedThrasherStr
) {
    var hostedThrasherTemplate;

    var HostedThrasherMulti = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    HostedThrasherMulti.prototype.create = function () {
        hostedThrasherTemplate = template(hostedThrasherStr);

        fastdom.write(function () {
            var videoLength1 = this.params.videoLength1;
            if (videoLength1){
                var seconds = videoLength1 % 60;
                var minutes = (videoLength1 - seconds) / 60;
                this.params.timeString1 = minutes + (seconds < 10 ? ':0' : ':') + seconds;
            }

            this.params.linkTracking1 = 'Labs hosted container' +
                ' | ' + config.page.edition +
                ' | ' + config.page.section +
                ' | ' + this.params.subHeader1 +
                ' | ' + this.params.sponsorName;
            this.$adSlot.append(hostedThrasherTemplate({ data: this.params }));
            if (this.params.trackingPixel) {
                addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
            }
            console.log(this.params);
        }, this);
    };

    return HostedThrasherMulti;

});
