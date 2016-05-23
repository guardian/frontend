define([
    'qwery',
    'bonzo',
    'fastdom',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'tpl!common/views/commercial/creatives/fabric-v1.html',
    'tpl!common/views/commercial/creatives/iframe-video.html',
    'tpl!common/views/commercial/creatives/scrollbg.html',
    'lodash/objects/merge'
], function (
    $,
    bonzo,
    fastdom,
    detect,
    mediator,
    addTrackingPixel,
    fabricV1Tpl,
    iframeVideoTpl,
    scrollBgTpl,
    merge
) {
    var hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();
    var isEnhanced = detect.isEnhanced();
    var isIE10OrLess = detect.getUserAgent.browser === 'MSIE' && (parseInt(detect.getUserAgent.version) <= 10);

    // This is a hasty clone of fluid250.js

    var FabricV1 = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    FabricV1.prototype.create = function () {
        this.$adSlot.addClass('ad-slot__fabric-v1 content__mobile-full-width');

        var videoPosition = {
            position: this.params.videoPositionH === 'left' || this.params.videoPositionH === 'right' ?
            this.params.videoPositionH + ':' + this.params.videoHorizSpace + 'px;' : ''
        };

        var templateOptions = {
            showLabel: this.params.showAdLabel !== 'hide',
            video: this.params.videoURL ? iframeVideoTpl(merge(this.params, videoPosition)) : '',
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

        fastdom.write(function () {
            this.$adSlot.append(fabricV1Tpl({data: merge(this.params, templateOptions)}));
            this.scrollingBg = $('.ad-scrolling-bg', this.$adSlot[0]);
            this.layer2 = $('.hide-until-tablet .fabric-v1_layer2', this.$adSlot[0]);
            this.scrollType = this.params.backgroundImagePType;

            // layer two animations must not have a background position, otherwise the background will
            // be visible before the animation has been initiated.
            if (this.params.layerTwoAnimation === 'enabled' && isEnhanced && !isIE10OrLess) {
                bonzo(this.layer2).css('background-position', '');
            }

            if (this.scrollType === 'fixed' && hasScrollEnabled) {
                bonzo(this.scrollingBg).css('background-attachment', 'fixed');
            }

        }, this);

        if (templateOptions.scrollbg && hasScrollEnabled) {
            // update bg position
            fastdom.read(this.updateBgPosition, this);
            mediator.on('window:throttledScroll', this.updateBgPosition.bind(this));
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition.bind(this));
        }

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }
    };

    FabricV1.prototype.updateBgPosition = function () {
        if (this.scrollType === 'parallax') {
            var scrollAmount = Math.ceil((window.pageYOffset - this.$adSlot.offset().top) * 0.3 * -1) + 20;
            fastdom.write(function () {
                bonzo(this.scrollingBg)
                    .addClass('ad-scrolling-bg-parallax')
                    .css('background-position', '50% ' + scrollAmount + '%');
            }, this);
        }
        this.layer2Animation();
    };

    FabricV1.prototype.layer2Animation = function () {
        var inViewB;
        if (this.params.layerTwoAnimation === 'enabled' && isEnhanced && !isIE10OrLess) {
            inViewB = (window.pageYOffset + bonzo.viewport().height) > this.$adSlot.offset().top;
            fastdom.write(function () {
                bonzo(this.layer2).addClass('ad-scrolling-text-hide' + (this.params.layerTwoAnimationPosition ? '-' + this.params.layerTwoAnimationPosition : ''));
                if (inViewB) {
                    bonzo(this.layer2).addClass('ad-scrolling-text-animate' + (this.params.layerTwoAnimationPosition ? '-' + this.params.layerTwoAnimationPosition : ''));
                }
            }, this);
        }
    };

    return FabricV1;
});
