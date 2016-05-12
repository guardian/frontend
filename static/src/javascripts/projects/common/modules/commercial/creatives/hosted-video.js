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
    var hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();
    var isEnhanced = detect.isEnhanced();
    var isIE9OrLess = detect.getUserAgent.browser === 'MSIE' && (detect.getUserAgent.version === '9' || detect.getUserAgent.version === '8');

    var hostedVideoTpl;
    var iframeVideoTpl;
    var scrollBgTpl;

    var HostedVideo = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    HostedVideo.prototype.create = function () {
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
        if (templateOptions.scrollbg) {
            this.scrollingBg = $('.ad-scrolling-bg', this.$adSlot[0]);
            this.layer2 = $('.hide-until-tablet .hostedVideo_layer2', this.$adSlot[0]);

            if (hasScrollEnabled) {
                // update bg position
                fastdom.read(this.updateBgPosition, this);
                mediator.on('window:throttledScroll', this.updateBgPosition.bind(this));
                // to be safe, also update on window resize
                mediator.on('window:resize', this.updateBgPosition.bind(this));
            }
        }

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }
    };

    HostedVideo.prototype.updateBgPosition = function () {
        if (this.params.backgroundImagePType === 'parallax') {
            var scrollAmount = Math.ceil((window.pageYOffset - this.$adSlot.offset().top) * 0.3 * -1) + 20;
            fastdom.write(function () {
                bonzo(this.scrollingBg)
                    .addClass('ad-scrolling-bg-parallax')
                    .css('background-position', '50% ' + scrollAmount + '%');
            }, this);
        }

        this.layer2Animation();
    };

    HostedVideo.prototype.layer2Animation = function () {
        var inViewB;
        if (this.params.layerTwoAnimation === 'enabled' && isEnhanced && !isIE9OrLess) {
            inViewB = (window.pageYOffset + bonzo.viewport().height) > this.$adSlot.offset().top;
            fastdom.write(function () {
                bonzo(this.layer2).addClass('ad-scrolling-text-hide' + (this.params.layerTwoAnimationPosition ? '-' + this.params.layerTwoAnimationPosition : ''));
                if (inViewB) {
                    bonzo(this.layer2).addClass('ad-scrolling-text-animate' + (this.params.layerTwoAnimationPosition ? '-' + this.params.layerTwoAnimationPosition : ''));
                }
            }, this);
        }
    };

    return HostedVideo;

});
