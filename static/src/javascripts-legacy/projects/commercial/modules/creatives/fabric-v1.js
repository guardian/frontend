define([
    'lib/fastdom-promise',
    'lib/detect',
    'lodash/utilities/template',
    'lib/mediator',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker',
    'raw-loader!commercial/views/creatives/fabric-v1.html',
    'raw-loader!commercial/views/creatives/iframe-video.html',
    'raw-loader!commercial/views/creatives/scrollbg.html',
    'lodash/objects/merge'
], function (
    fastdom,
    detect,
    template,
    mediator,
    addTrackingPixel,
    addViewabilityTracker,
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

    var FabricV1 = function (adSlot, params) {
        this.adSlot = adSlot;
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
            id: 'fabric-' + (Math.random() * 10000 | 0).toString(16),
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
            addTrackingPixel(this.params.trackingPixel + this.params.cacheBuster);
        }

        if (this.params.researchPixel) {
            addTrackingPixel(this.params.researchPixel + this.params.cacheBuster);
        }

        return fastdom.write(function () {
            this.adSlot.insertAdjacentHTML('beforeend', fabricV1Tpl({data: merge(this.params, templateOptions)}));
            this.scrollingBg = this.adSlot.querySelector('.ad-scrolling-bg');
            this.layer2 = this.adSlot.querySelector('.hide-until-tablet .fabric-v1_layer2');
            this.scrollType = this.params.backgroundImagePType;

            // layer two animations must not have a background position, otherwise the background will
            // be visible before the animation has been initiated.
            if (this.params.layerTwoAnimation === 'enabled' && isEnhanced && !isIE10OrLess) {
                this.layer2.style.backgroundPosition = '';
            }

            if (this.scrollType === 'fixed' && hasBackgroundFixedSupport) {
                this.scrollingBg.style.backgroundAttachment = 'fixed';
            }

            this.adSlot.classList.add('ad-slot--fabric-v1', 'ad-slot--fabric', 'content__mobile-full-width');
            if( this.adSlot.parentNode.classList.contains('top-banner-ad-container') ) {
                this.adSlot.parentNode.classList.add('top-banner-ad-container--fabric');
            }

            if (this.params.viewabilityTracker) {
                addViewabilityTracker(this.adSlot, this.params.id, this.params.viewabilityTracker);
            }

            return true;
        }, this);
    };

    FabricV1.prototype.updateBgPosition = function () {
        if (this.scrollType === 'parallax') {
            var scrollAmount = Math.ceil(this.adSlot.getBoundingClientRect().top * 0.3) + 20;
            fastdom.write(function () {
                this.scrollingBg.classList.add('ad-scrolling-bg-parallax');
                this.scrollingBg.style.backgroundPosition = '50% ' + scrollAmount + '%';
            }, this);
        } else if (this.scrollType === 'fixed' && !hasBackgroundFixedSupport) {
            var adRect = this.adSlot.getBoundingClientRect();
            var vPos = (window.innerHeight - adRect.bottom + adRect.height / 2) / window.innerHeight * 100;
            fastdom.write(function () {
                this.scrollingBg.style.backgroundPosition = '50% ' + vPos + '%';
            }, this);
        }
        this.layer2Animation();
    };

    FabricV1.prototype.layer2Animation = function () {
        var inViewB;
        if (this.params.layerTwoAnimation === 'enabled' && isEnhanced && !isIE10OrLess) {
            inViewB = detect.getViewport().height > this.adSlot.getBoundingClientRect().top;
            fastdom.write(function () {
                this.layer2.classList.add('ad-scrolling-text-hide' + (this.params.layerTwoAnimationPosition ? '-' + this.params.layerTwoAnimationPosition : ''));
                if (inViewB) {
                    this.layer2.classList.add('ad-scrolling-text-animate' + (this.params.layerTwoAnimationPosition ? '-' + this.params.layerTwoAnimationPosition : ''));
                }
            }, this);
        }
    };

    return FabricV1;
});
