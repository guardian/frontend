define([
    'bean',
    'lib/fastdom-promise',
    'lib/$',
    'lib/detect',
    'lib/mediator',
    'lib/storage',
    'lodash/utilities/template',
    'raw-loader!commercial/views/creatives/fabric-expanding-v1.html',
    'raw-loader!commercial/views/creatives/fabric-expanding-video.html',
    'svgs/icon/arrow-down.svg',
    'svgs/icon/close-central.svg',
    'lodash/functions/bindAll',
    'lodash/objects/merge',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker'
], function (
    bean,
    fastdom,
    $,
    detect,
    mediator,
    storage,
    template,
    fabricExpandingV1Html,
    fabricExpandingVideoHtml,
    arrowDown,
    closeCentral,
    bindAll,
    merge,
    addTrackingPixel,
    addViewabilityTracker
) {
    // Forked from expandable-v3.js

    var FabricExpandingV1 = function (adSlot, params) {
        this.adSlot       = adSlot;
        this.params       = params;
        this.isClosed     = true;
        this.initialExpandCounter = false;

        this.closedHeight = 250;
        this.openedHeight = 500;

        bindAll(this, 'updateBgPosition', 'listener');
    };

    FabricExpandingV1.hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();

    FabricExpandingV1.prototype.updateBgPosition = function () {
        var that = this;

        var viewportHeight = detect.getViewport().height;
        var adSlotTop = this.adSlot.getBoundingClientRect().top;

        var adHeight = (this.isClosed) ? this.closedHeight : this.openedHeight;
        var inViewB = viewportHeight > adSlotTop;
        var inViewT = -adHeight * 2 < adSlotTop + 20;
        var topCusp = inViewT && (viewportHeight * 0.4 - adHeight > adSlotTop) ?
            'true' : 'false';
        var bottomCusp = inViewB && (viewportHeight * 0.5 < adSlotTop) ?
            'true' : 'false';
        var bottomScroll = (bottomCusp === 'true') ?
        50 - ((viewportHeight * 0.5 - adSlotTop) * -0.2) : 50;
        var topScroll = (topCusp === 'true') ?
            ((viewportHeight * 0.4 - adSlotTop - adHeight) * 0.2) : 0;

        var scrollAmount;

        switch (this.params.backgroundImagePType) {
            case 'split':
                scrollAmount = bottomScroll + topScroll;
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', that.adSlot).css({
                        'background-repeat': 'no-repeat',
                        'background-position': '50%' + scrollAmount + '%'
                    });
                });
                break;
            case 'fixed':
                scrollAmount = -adSlotTop;
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', that.adSlot).css('background-position', '50%' + (scrollAmount  + 'px'));
                });
                break;
            case 'fixed matching fluid250':
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', that.adSlot).addClass('ad-exp--expand-scrolling-bg-fixed');
                });
                break;
            case 'parallax':
                scrollAmount = Math.ceil(adSlotTop * 0.3) + 20;
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', that.adSlot).addClass('ad-exp--expand-scrolling-bg-parallax');
                    $('.ad-exp--expand-scrolling-bg', that.adSlot).css('background-position', '50%' + (scrollAmount + '%'));
                });
                break;
            case 'none' :
                break;
        }
    };

    FabricExpandingV1.prototype.listener = function () {
        var that = this;
        if (!this.initialExpandCounter && detect.getViewport().height > that.adSlot.getBoundingClientRect().top + this.openedHeight) {
            var itemId = $('.ad-slot__content', that.adSlot).attr('id'),
                itemIdArray = itemId.split('/');

            if (!storage.local.get('gu.commercial.expandable.' + itemIdArray[1])) {
                // expires in 1 week
                var week = 1000 * 60 * 60 * 24 * 7;
                fastdom.write(function () {
                    storage.local.set('gu.commercial.expandable.' + itemIdArray[1], true, { expires: Date.now() + week });
                    that.$button.addClass('button-spin');
                    $('.ad-exp__open-chevron').removeClass('chevron-up').addClass('chevron-down');
                    that.$ad.css('height', that.openedHeight);
                    that.isClosed = false;
                    that.initialExpandCounter = true;
                });
            } else if (this.isClosed) {
                fastdom.write(function () {
                    $('.ad-exp__open-chevron').addClass('chevron-up');
                });
            }
            return true;
        }
    };

    FabricExpandingV1.prototype.buildVideo = function (customClass) {
        var videoAspectRatio = 16 / 9;
        var videoHeight = detect.isBreakpoint({max: 'phablet'})
            ? 125
            : 250;
        var videoWidth = videoHeight * videoAspectRatio;
        var leftMargin = this.params.videoPositionH === 'center'
            ? 'margin-left: ' + videoWidth / -2 + 'px'
            : '';
        var leftPosition = this.params.videoPositionH === 'left'
            ? 'left: ' + this.params.videoHorizSpace + 'px'
            : '';
        var rightPosition = this.params.videoPositionH === 'right'
            ? 'right: ' + this.params.videoHorizSpace + 'px'
            : '';

        var viewModel = {
            width : videoWidth,
            height : videoHeight,
            src : this.params.videoURL + '?rel=0&amp;controls=0&amp;showinfo=0&amp;title=0&amp;byline=0&amp;portrait=0',
            className : [
                'expandable_video',
                'expandable_video--horiz-pos-' + this.params.videoPositionH,
                customClass
            ].join(' '),
            inlineStyle : [leftMargin, leftPosition, rightPosition].join('; ')
        };

        return template(fabricExpandingVideoHtml, viewModel);
    };

    FabricExpandingV1.prototype.stopVideo = function (delay) {
        delay = delay || 0;

        var videoSelector = detect.isBreakpoint({min: 'tablet'}) ? '.js-fabric-video--desktop' : '.js-fabric-video--mobile';
        var video = $(videoSelector, this.adSlot);
        var videoSrc = video.attr('src');

        window.setTimeout(function () {
            video.attr('src', videoSrc + '&amp;autoplay=0');
        }, delay);
    };

    FabricExpandingV1.prototype.create = function () {
        var hasVideo = this.params.videoURL !== '';
        var videoDesktop = {
            videoDesktop: hasVideo ? this.buildVideo('js-fabric-video--desktop') : ''
        };
        var videoMobile = {
            videoMobile: hasVideo ? this.buildVideo('js-fabric-video--mobile') : ''
        };
        var showmoreArrow = {
            showArrow: (this.params.showMoreType === 'arrow-only' || this.params.showMoreType === 'plus-and-arrow') ?
            '<button class="ad-exp__open-chevron ad-exp__open">' + arrowDown.markup + '</button>' : ''
        };
        var showmorePlus = {
            showPlus: (this.params.showMoreType === 'plus-only' || this.params.showMoreType === 'plus-and-arrow') ?
            '<button class="ad-exp__close-button ad-exp__open">' + closeCentral.markup + '</button>' : ''
        };
        var scrollbgDefaultY = '0%'; // used if no parallax / fixed background scroll support
        var scrollingbg = {
            scrollbg: this.params.backgroundImagePType !== 'none' ?
            '<div class="ad-exp--expand-scrolling-bg" style="background-image: url(' + this.params.backgroundImageP + '); background-position: ' + this.params.backgroundImagePPosition + ' ' + scrollbgDefaultY + '; background-repeat: ' + this.params.backgroundImagePRepeat + ';"></div>' : ''
        };
        this.params.id = 'fabric-expanding-' + (Math.random() * 10000 | 0).toString(16);
        var $fabricExpandingV1 = $.create(template(fabricExpandingV1Html, { data: merge(this.params, showmoreArrow, showmorePlus, videoDesktop, videoMobile, scrollingbg) }));

        mediator.on('window:throttledScroll', this.listener);

        bean.on(this.adSlot, 'click', '.ad-exp__open', function () {
            if (!this.isClosed && hasVideo) {
                // wait 1000ms for close animation to finish
                this.stopVideo(1000);
            }

            fastdom.write(function () {
                $('.ad-exp__close-button').toggleClass('button-spin');
                $('.ad-exp__open-chevron').removeClass('chevron-up').toggleClass('chevron-down');
                this.$ad.css('height', this.isClosed ? this.openedHeight : this.closedHeight);
                this.isClosed = !this.isClosed;
                this.initialExpandCounter = true;
            }.bind(this));
        }.bind(this));

        if (FabricExpandingV1.hasScrollEnabled) {
            // update bg position
            this.updateBgPosition();

            mediator.on('window:throttledScroll', this.updateBgPosition);
            // to be safe, also update on window resize
            mediator.on('window:throttledResize', this.updateBgPosition);
        }

        return fastdom.write(function () {

            this.$ad     = $('.ad-exp--expand', $fabricExpandingV1).css('height', this.closedHeight);
            this.$button = $('.ad-exp__open', $fabricExpandingV1);

            $('.ad-exp-collapse__slide', $fabricExpandingV1).css('height', this.closedHeight);

            if (this.params.trackingPixel) {
                addTrackingPixel(this.params.trackingPixel + this.params.cacheBuster);
            }

            if (this.params.researchPixel) {
                addTrackingPixel(this.params.researchPixel + this.params.cacheBuster);
            }

            $fabricExpandingV1.appendTo(this.adSlot);

            if (this.params.viewabilityTracker) {
                addViewabilityTracker(this.adSlot, this.params.id, this.params.viewabilityTracker);
            }

            this.adSlot.classList.add('ad-slot--fabric');

            if( this.adSlot.parentNode.classList.contains('top-banner-ad-container') ) {
                this.adSlot.parentNode.classList.add('top-banner-ad-container--fabric');
            }
            return true;
        }, this);
    };

    return FabricExpandingV1;

});
