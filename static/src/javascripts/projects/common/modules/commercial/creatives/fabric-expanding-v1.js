define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/creatives/fabric-expanding-v1.html',
    'lodash/functions/bindAll',
    'lodash/objects/merge',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'Promise'
], function (
    bean,
    bonzo,
    fastdom,
    $,
    detect,
    mediator,
    storage,
    template,
    svgs,
    fabricExpandingV1Html,
    bindAll,
    merge,
    addTrackingPixel,
    Promise
) {

    var FabricExpandingV1 = function ($adSlot, params) {
        this.$adSlot      = $adSlot;
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

        var scrollY = window.pageYOffset;
        var viewportHeight = bonzo.viewport().height;
        var adSlotTop = this.$adSlot.offset().top;

        var adHeight = (this.isClosed) ? this.closedHeight : this.openedHeight;
        var inViewB = ((scrollY + viewportHeight) > adSlotTop);
        var inViewT = ((scrollY - (adHeight * 2)) < adSlotTop + 20);
        var topCusp = (inViewT &&
        ((scrollY + (viewportHeight * 0.4) - adHeight) > adSlotTop)) ?
            'true' : 'false';
        var bottomCusp = (inViewB &&
        (scrollY + (viewportHeight * 0.5)) < adSlotTop) ?
            'true' : 'false';
        var bottomScroll = (bottomCusp === 'true') ?
        50 - ((scrollY + (viewportHeight * 0.5) - adSlotTop) * -0.2) : 50;
        var topScroll = (topCusp === 'true') ?
            ((scrollY + (viewportHeight * 0.4) - adSlotTop - adHeight) * 0.2) : 0;

        switch (this.params.backgroundImagePType) {
            case 'split':
                this.scrollAmount = bottomScroll + topScroll + '%';
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', that.$adSlot).css({
                        'background-repeat': 'no-repeat',
                        'background-position': '50%' + that.scrollAmount
                    });
                });
                break;
            case 'fixed':
                this.scrollAmount = (scrollY - adSlotTop) + 'px';
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', that.$adSlot).css('background-position', '50%' + that.scrollAmount);
                });
                break;
            case 'fixed matching fluid250':
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', that.$adSlot).addClass('ad-exp--expand-scrolling-bg-fixed');
                });
                break;
            case 'parallax':
                this.scrollAmount = Math.ceil((scrollY - adSlotTop) * 0.3 * -1) + 20;
                this.scrollAmountP = this.scrollAmount + '%';
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', that.$adSlot).addClass('ad-exp--expand-scrolling-bg-parallax');
                    $('.ad-exp--expand-scrolling-bg', that.$adSlot).css('background-position', '50%' + that.scrollAmountP);
                });
                break;
        }
    };

    FabricExpandingV1.prototype.listener = function () {
        var that = this;
        if (!this.initialExpandCounter && (window.pageYOffset + bonzo.viewport().height) > that.$adSlot.offset().top + this.openedHeight) {
            var itemId = $('.ad-slot__content', that.$adSlot).attr('id'),
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

    FabricExpandingV1.prototype.create = function () {
        var videoHeight = this.closedHeight - 24,
            videoWidth = (videoHeight * 16) / 9,
            leftMargin = (this.params.videoPositionH === 'center' ?
                'margin-left: ' + videoWidth / -2 + 'px; ' : ''
            ),
            leftPosition = (this.params.videoPositionH === 'left' ?
                'left: ' + this.params.videoHorizSpace + 'px; ' : ''
            ),
            rightPosition = (this.params.videoPositionH === 'right' ?
                'right: ' + this.params.videoHorizSpace + 'px; ' : ''
            ),
            videoDesktop = {
                video: (this.params.videoURL !== '') ?
                '<iframe id="myYTPlayer" width="' + videoWidth + '" height="' + videoHeight + '" src="' + this.params.videoURL + '?rel=0&amp;controls=0&amp;showinfo=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="expandable_video expandable_video--horiz-pos-' + this.params.videoPositionH + '" style="' + leftMargin + leftPosition + rightPosition + '"></iframe>' : ''
            },
            showmoreArrow = {
                showArrow: (this.params.showMoreType === 'arrow-only' || this.params.showMoreType === 'plus-and-arrow') ?
                '<button class="ad-exp__open-chevron ad-exp__open">' + svgs('arrowdownicon') + '</button>' : ''
            },
            showmorePlus = {
                showPlus: (this.params.showMoreType === 'plus-only' || this.params.showMoreType === 'plus-and-arrow') ?
                '<button class="ad-exp__close-button ad-exp__open">' + svgs('closeCentralIcon') + '</button>' : ''
            },
            scrollingbg = {
                scrollbg: (this.params.backgroundImagePType !== '' || this.params.backgroundImagePType !== 'none') ?
                '<div class="ad-exp--expand-scrolling-bg" style="background-image: url(' + this.params.backgroundImageP + '); background-position: ' + this.params.backgroundImagePPosition + ' 50%; background-repeat: ' + this.params.backgroundImagePRepeat + ';"></div>' : ''
            },
            $fabricExpandingV1 = $.create(template(fabricExpandingV1Html, { data: merge(this.params, showmoreArrow, showmorePlus, videoDesktop, scrollingbg) }));

        var domPromise = new Promise(function (resolve) {
            fastdom.write(function () {

                this.$ad     = $('.ad-exp--expand', $fabricExpandingV1).css('height', this.closedHeight);
                this.$button = $('.ad-exp__open', $fabricExpandingV1);

                $('.ad-exp-collapse__slide', $fabricExpandingV1).css('height', this.closedHeight);

                if (this.params.trackingPixel) {
                    addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
                }

                $fabricExpandingV1.appendTo(this.$adSlot);
                resolve();
            }.bind(this));
        }.bind(this));

        mediator.on('window:throttledScroll', this.listener);

        bean.on(this.$adSlot[0], 'click', '.ad-exp__open', function () {
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
            mediator.on('window:resize', this.updateBgPosition);
        }

        return domPromise;
    };

    return FabricExpandingV1;

});
