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
    'text!common/views/commercial/creatives/expandable-v2.html',
    'lodash/functions/bindAll',
    'lodash/objects/merge'
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
    expandableV2Tpl,
    bindAll,
    merge) {

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028247
     */
    var ExpandableV2 = function ($adSlot, params) {
        this.$adSlot      = $adSlot;
        this.params       = params;
        this.isClosed     = true;

        if (detect.isBreakpoint({min: 'tablet'})) {
            this.closedHeight = 250;
            this.openedHeight = 500;
        } else {
            this.closedHeight = 150;
            this.openedHeight = 300;
        }

        if (typeof expandableV2Tpl === 'string') {
            expandableV2Tpl = template(expandableV2Tpl);
        }

        bindAll(this, 'updateBgPosition', 'listener');
    };

    /**
     * TODO: rather blunt instrument this, due to the fact *most* mobile devices don't have a fixed
     * background-attachment - need to make this more granular
     */
    ExpandableV2.hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();

    ExpandableV2.prototype.updateBgPosition = function () {
        var scrollY = window.pageYOffset,
            viewportHeight = bonzo.viewport().height,
            adSlotTop = this.$adSlot.offset().top,
            that = this;

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
                    $('.ad-exp--expand-scrolling-bg').css('background-repeat', 'no-repeat');
                });
                break;
            case 'fixed':
                this.scrollAmount = (scrollY - adSlotTop) + 'px';
                break;
            case 'parallax':
                this.scrollAmount = ((scrollY - adSlotTop) * 0.15) + '%';
                break;
        }

        fastdom.write(function () {
            $('.ad-exp--expand-scrolling-bg').css('background-position', '50%' + that.scrollAmount);
        });
    };

    ExpandableV2.prototype.listener = function () {
        var that = this;
        if ((window.pageYOffset + bonzo.viewport().height) > (this.$adSlot.offset().top + this.openedHeight)) {
            // expires in 1 week
            var week = 1000 * 60 * 60 * 24 * 7;

            storage.local.set('gu.commercial.expandable.' + this.params.ecid, true, { expires: Date.now() + week });
            fastdom.write(function () {
                that.$button.toggleClass('button-spin');
                $('.ad-exp__open-chevron').toggleClass('chevron-down');
                that.$ad.css('height', that.openedHeight);
                that.isClosed = false;
            });
            return true;
        }
    };

    ExpandableV2.prototype.create = function () {
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
                    '<div class="ad-exp--expand-scrolling-bg" style="background-image: url(' + this.params.backgroundImageP + '); background-position: ' + this.params.backgroundImagePPosition + ' 50%;"></div>' : ''
            },
            $expandablev2 = $.create(expandableV2Tpl({ data: merge(this.params, showmoreArrow, showmorePlus, videoDesktop, scrollingbg) }));

        var domPromise = new Promise(function (resolve) {
            fastdom.write(function () {

                this.$ad     = $('.ad-exp--expand', $expandablev2).css('height', this.closedHeight);
                this.$button = $('.ad-exp__open', $expandablev2);

                $('.ad-exp-collapse__slide', $expandablev2).css('height', this.closedHeight);

                if (this.params.trackingPixel) {
                    this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
                }

                $expandablev2.appendTo(this.$adSlot);

                resolve();
            }.bind(this));
        }.bind(this));

        if (!storage.local.get('gu.commercial.expandable.' + this.params.ecid)) {
            mediator.on('window:throttledScroll', this.listener);
        }

        bean.on(this.$adSlot[0], 'click', '.ad-exp__open', function () {
            fastdom.write(function () {
                $('.ad-exp__close-button').toggleClass('button-spin');
                $('.ad-exp__open-chevron').toggleClass('chevron-down');
                this.$ad.css('height', this.isClosed ? this.openedHeight : this.closedHeight);
                this.isClosed = !this.isClosed;
            }.bind(this));
        }.bind(this));

        if (ExpandableV2.hasScrollEnabled) {
            // update bg position
            this.updateBgPosition();

            mediator.on('window:throttledScroll', this.updateBgPosition);
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition);
        }

        return domPromise;
    };

    return ExpandableV2;

});
