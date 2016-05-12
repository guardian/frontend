define([
    'qwery',
    'bonzo',
    'fastdom',
    'common/utils/detect',
    'common/utils/template',
    'common/utils/mediator',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/hosted-video.html',
    'text!common/views/commercial/creatives/iframe-video.html',
    'text!common/views/commercial/creatives/scrollbg.html',
    'lodash/objects/merge'
], function (
    $,
    bonzo,
    fastdom,
    detect,
    template,
    mediator,
    addTrackingPixel,
    hostedVideoStr,
    iframeVideoStr,
    scrollBgStr,
    merge
) {
    var isEnhanced = detect.isEnhanced();

    var hostedVideoTpl;
    var iframeVideoTpl;
    var scrollBgTpl;

    var HostedThrasher = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    HostedThrasher.prototype.create = function () {
        if (!hostedVideoTpl) {
            hostedVideoTpl = template(hostedVideoStr);
            iframeVideoTpl = template(iframeVideoStr);
            scrollBgTpl = template(scrollBgStr);
        }

        var position = {
            position: this.params.videoPositionH === 'left' || this.params.videoPositionH === 'right' ?
                this.params.videoPositionH + ':' + this.params.videoHorizSpace + 'px;' :
                ''
        };

        var templateOptions = {
            creativeHeight: this.params.creativeHeight || '',
            isFixedHeight: this.params.creativeHeight === 'fixed',
            showLabel: this.params.showAdLabel !== 'hide',
            video: this.params.videoURL ? iframeVideoTpl(merge(this.params, position)) : '',
            hasContainer: 'layerTwoAnimation' in this.params,
            layerTwoBGPosition: this.params.layerTwoBGPosition && (
                !this.params.layerTwoAnimation ||
                this.params.layerTwoAnimation === 'disabled' ||
                (!isEnhanced && this.params.layerTwoAnimation === 'enabled')
            ) ?
                this.params.layerTwoBGPosition :
                '0% 0%',
            scrollbg: this.params.backgroundImagePType && this.params.backgroundImagePType !== 'none' ?
                scrollBgTpl(this.params) :
                false
        };

        this.$adSlot.append(hostedVideoTpl({ data: merge(this.params, templateOptions) }));

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }
    };

    return HostedThrasher;

});
