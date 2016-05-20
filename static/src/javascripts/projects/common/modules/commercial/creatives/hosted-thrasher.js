define([
    'common/utils/fastdom-promise',
    'common/utils/config',
    'common/modules/commercial/hosted-video',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'template!common/views/commercial/creatives/hosted-thrasher.html'
], function (
    fastdom,
    config,
    hostedVideo,
    addTrackingPixel,
    hostedThrasherTemplate
) {

    var HostedThrasher = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    HostedThrasher.prototype.create = function () {
        fastdom.write(function () {
            var title = this.params.header2 || 'unknown';
            var sponsor = 'Renault';
            this.params.linkTracking = 'GLabs-hosted-container' +
                ' | ' + config.page.edition +
                ' | ' + config.page.section +
                ' | ' + title +
                ' | ' + sponsor;
            this.$adSlot.append(hostedThrasherTemplate({ data: this.params }));
            if (this.params.trackingPixel) {
                addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
            }
        }, this).then(hostedVideo.init);
    };

    return HostedThrasher;

});
