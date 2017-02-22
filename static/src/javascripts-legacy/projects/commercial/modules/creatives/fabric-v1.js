define([
    'qwery',
    'bonzo',
    'common/utils/fastdom-promise',
    'common/utils/detect',
    'common/utils/template',
    'common/utils/mediator',
    'commercial/modules/creatives/add-tracking-pixel',
    'raw-loader!commercial/views/creatives/fabric-v1.html',
    'raw-loader!commercial/views/creatives/iframe-video.html',
    'raw-loader!commercial/views/creatives/scrollbg.html',
    'lodash/objects/merge'
], function (
    $,
    bonzo,
    fastdom,
    detect,
    template,
    mediator,
    addTrackingPixel,
    fabricV1Html,
    iframeVideoStr,
    scrollBgStr,
    merge
) {
    var hasBackgroundFixedSupport = !detect.isAndroid();
    var isEnhanced = detect.isEnhanced();
    var isIE10OrLess = detect.getUserAgent.browser === 'MSIE' && (parseInt(detect.getUserAgent.version) <= 10);

    var fabricV1Tpl;
    var iframeVideoTpl;
    var scrollBgTpl;

    // This is a hasty clone of fluid250.js

    var FabricV1 = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    FabricV1.prototype.create = function () {
        if (!fabricV1Tpl) {
            fabricV1Tpl = template(fabricV1Html);
            iframeVideoTpl = template(iframeVideoStr);
            scrollBgTpl = template(scrollBgStr);
        }

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

        if (templateOptions.scrollbg) {
            // update bg position
            fastdom.read(this.updateBgPosition, this);
            mediator.on('window:throttledScroll', this.updateBgPosition.bind(this));
            // to be safe, also update on window resize
            mediator.on('window:throttledResize', this.updateBgPosition.bind(this));
        }

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }

        return fastdom.write(function () {
            this.$adSlot.append(fabricV1Tpl({data: merge(this.params, templateOptions)}));
            this.scrollingBg = $('.ad-scrolling-bg', this.$adSlot[0]);
            this.layer2 = $('.hide-until-tablet .fabric-v1_layer2', this.$adSlot[0]);
            this.scrollType = this.params.backgroundImagePType;

            // layer two animations must not have a background position, otherwise the background will
            // be visible before the animation has been initiated.
            if (this.params.layerTwoAnimation === 'enabled' && isEnhanced && !isIE10OrLess) {
                bonzo(this.layer2).css('background-position', '');
            }

            if (this.scrollType === 'fixed' && hasBackgroundFixedSupport) {
                bonzo(this.scrollingBg).css('background-attachment', 'fixed');
            }

            this.$adSlot.addClass('ad-slot--fabric-v1 ad-slot--fabric content__mobile-full-width');
            if( this.$adSlot.parent().hasClass('top-banner-ad-container') ) {
                this.$adSlot.parent().addClass('top-banner-ad-container--fabric');
            }

            return true;
        }, this);
    };

    FabricV1.prototype.updateBgPosition = function () {
        if (this.scrollType === 'parallax') {
            var scrollAmount = Math.ceil((window.pageYOffset - this.$adSlot.offset().top) * 0.3 * -1) + 20;
            fastdom.write(function () {
                bonzo(this.scrollingBg)
                    .addClass('ad-scrolling-bg-parallax')
                    .css('background-position', '50% ' + scrollAmount + '%');
            }, this);
        } else if (this.scrollType === 'fixed' && !hasBackgroundFixedSupport) {
            var adRect = this.$adSlot[0].getBoundingClientRect();
            var vPos = (window.innerHeight - adRect.bottom + adRect.height / 2) / window.innerHeight * 100;
            fastdom.write(function () {
                bonzo(this.scrollingBg).css('background-position', '50% ' + vPos + '%');
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
