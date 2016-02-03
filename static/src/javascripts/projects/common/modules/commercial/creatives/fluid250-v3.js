define([
    'bonzo',
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250.html',
    'text!common/views/commercial/creatives/iframe-video.html',
    'text!common/views/commercial/creatives/scrollbg.html',
    'lodash/objects/merge',
    'common/modules/commercial/creatives/add-tracking-pixel'
], function (
    bonzo,
    fastdom,
    $,
    detect,
    mediator,
    template,
    fluid250Tpl,
    iframeVideoTpl,
    scrollBgTpl,
    merge,
    addTrackingPixel
) {
    var Fluid250 = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    Fluid250.hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();

    Fluid250.isModernBrowser = detect.isModernBrowser();

    Fluid250.isIE9OrLess = detect.getUserAgent.browser === 'MSIE' && (detect.getUserAgent.version === '9' || detect.getUserAgent.version === '8');

    Fluid250.prototype.updateBgPosition = function () {
        if (this.params.backgroundImagePType === 'parallax') {
            this.scrollAmount = Math.ceil((window.pageYOffset - this.$adSlot.offset().top) * 0.3 * -1) + 20;
            this.scrollAmountP += '%';
            fastdom.write(function () {
                this.$scrollingBg
                    .addClass('ad-scrolling-bg-parallax')
                    .css('background-position', '50%' + this.scrollAmountP);
            }, this);
        }

        this.layer2Animation();
    };

    Fluid250.prototype.layer2Animation = function () {
        var inViewB;
        if (this.params.layerTwoAnimation === 'enabled' && Fluid250.isModernBrowser && !Fluid250.isIE9OrLess) {
            inViewB = (window.pageYOffset + bonzo.viewport().height) > this.$adSlot.offset().top;
            fastdom.write(function () {
                this.$layer2.addClass('ad-scrolling-text-hide');
                if (inViewB) {
                    this.$layer2.addClass('ad-scrolling-text-animate');
                }
            }, this);
        }
    };

    Fluid250.prototype.create = function () {
        var position = {
            position: this.params.videoPositionH === 'left' || this.params.videoPositionH === 'right' ?
                this.params.videoPositionH + ': ' + this.params.videoHorizSpace + 'px' :
                '';
        };
        var templateOptions = {
            isFixedHeight: this.params.creativeHeight === 'fixed',
            showLabel: this.params.showAdLabel === 'hide' ? 'creative__label--hidden' : '',

            layerTwoBGPosition: (!this.params.layerTwoAnimation || this.params.layerTwoAnimation === '' || this.params.layerTwoAnimation === 'disabled' || (!Fluid250.isModernBrowser && this.params.layerTwoAnimation === 'enabled')) ?
                this.params.layerTwoBGPosition : '0% 0%',

            video: this.params.videoURL ? template(iframeVideoTpl, { data: merge(this.params, position) }) : '',

            scrollbg: this.params.backgroundImagePType !== '' || this.params.backgroundImagePType !== 'none' ?
                template(scrollBgTpl, { data: this.params }) : ''
        };

        this.$adSlot.append(template(fluid250Tpl, { data: merge(this.params, templateOptions) }));
        this.$scrollingBg = $('.ad-scrolling-bg', this.$adSlot[0]);
        this.$layer2 = $('.hide-until-tablet .fluid250_layer2', this.$adSlot[0]);

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }

        if (Fluid250.hasScrollEnabled) {
            // update bg position
            fastdom.read(this.updateBgPosition, this);
            mediator.on('window:throttledScroll', this.updateBgPosition.bind(this));
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition.bind(this));
        }
    };

    return Fluid250;

});
