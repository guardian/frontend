define([
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250.html',
    'text!common/views/commercial/creatives/iframe-video.html',
    'lodash/objects/merge',
    'common/modules/commercial/creatives/add-tracking-pixel'
], function (
    template,
    fluid250Tpl,
    iframeVideoTpl,
    merge,
    addTrackingPixel
) {
    var Fluid250 = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    Fluid250.prototype.create = function () {
        var position = {
            position: this.params.videoPositionH === 'left' || this.params.videoPositionH === 'right' ?
                this.params.videoPositionH + ':' + this.params.videoHorizSpace + 'px;' :
                ''
        };
        var templateOptions = {
            isFixedHeight: this.params.creativeHeight === 'fixed',
            showLabel: this.params.showAdLabel !== 'hide',
            video: this.params.videoURL ?
                template(iframeVideoTpl, { data: merge(this.params, position) }) : ''
        };

        this.$adSlot.append(template(fluid250Tpl, { data: merge(this.params, templateOptions) }));

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }
    };

    return Fluid250;

});
