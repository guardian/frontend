define([
    'common/utils/fastdom-promise',
    'common/utils/config',
    'common/utils/template',
    'commercial/modules/creatives/add-tracking-pixel',
    'raw-loader!commercial/views/creatives/hosted-thrasher-multi.html'
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

        return fastdom.write(function () {
            this.setAdditionalParams(this.params);

            this.$adSlot.append(hostedThrasherTemplate({ data: this.params }));
            if (this.params.trackingPixel) {
                addTrackingPixel(this.params.trackingPixel + this.params.cacheBuster);
            }

            return true;
        }, this);
    };

    HostedThrasherMulti.prototype.setAdditionalParams = function () {
        for (var i = 1; i <= this.params.elementsNo; i++) {
            var videoLength = this.params['videoLength' + i];
            if (videoLength){
                var seconds = videoLength % 60;
                var minutes = (videoLength - seconds) / 60;
                this.params['timeString' + i] = minutes + (seconds < 10 ? ':0' : ':') + seconds;
            }

            this.params['linkTracking' + i] = 'Labs hosted container' +
            ' | ' + config.page.edition +
            ' | ' + config.page.section +
            ' | ' + this.params['subHeader' + i] +
            ' | ' + this.params.sponsorName;
        }
    };

    return HostedThrasherMulti;

});
