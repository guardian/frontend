define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/_',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/creatives/expandable-v3.html'
], function (
    bean,
    bonzo,
    fastdom,
    _,
    $,
	detect,
    mediator,
    storage,
    template,
    svgs,
    expandableV3Tpl
) {

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028247
     */
    var ExpandableV3 = function ($adSlot, params) {
        this.$adSlot      = $adSlot;
        this.params       = params;
        this.isClosed     = true;
        this.initialExpandCounter = false;

        if (detect.isBreakpoint({min: 'tablet'})) {
            this.closedHeight = 250;
            this.openedHeight = 500;
        } else {
            this.closedHeight = 150;
            this.openedHeight = 300;
        }
    };

    /**
     * TODO: rather blunt instrument this, due to the fact *most* mobile devices don't have a fixed
     * background-attachment - need to make this more granular
     */
    ExpandableV3.hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();

    ExpandableV3.prototype.updateBgPosition = function () {
        var adHeight, inViewB, inViewT, topCusp, bottomCusp, bottomScroll, topScroll;
        fastdom.read(function () {
            adHeight = (this.isClosed) ?
                this.closedHeight : this.openedHeight;
            inViewB = ((window.pageYOffset + bonzo.viewport().height) > this.$adSlot.offset().top);
            inViewT = ((window.pageYOffset - (adHeight * 2)) < this.$adSlot.offset().top + 20);
            topCusp = (inViewT &&
                ((window.pageYOffset + (bonzo.viewport().height * 0.4) - adHeight) > this.$adSlot.offset().top)) ?
                'true' : 'false';
            bottomCusp = (inViewB &&
                (window.pageYOffset + (bonzo.viewport().height * 0.5)) < this.$adSlot.offset().top) ?
                'true' : 'false';
            bottomScroll = (bottomCusp === 'true') ?
                50 - ((window.pageYOffset + (bonzo.viewport().height * 0.5) - this.$adSlot.offset().top) * -0.2) : 50;
            topScroll = (topCusp === 'true') ?
                ((window.pageYOffset + (bonzo.viewport().height * 0.4) - this.$adSlot.offset().top - adHeight) * 0.2) : 0;
        }.bind(this));

        switch (this.params.backgroundImagePType) {
            case 'split':
                fastdom.write(function () {
                    this.scrollAmount = bottomScroll + topScroll + '%';
                    $('.ad-exp--expand-scrolling-bg', $(this.$adSlot)).css({
                        'background-repeat': 'no-repeat',
                        'background-position': '50%' + this.scrollAmount
                    });
                }.bind(this));
                break;
            case 'fixed':
                fastdom.read(function () {
                    this.scrollAmount = (window.pageYOffset - this.$adSlot.offset().top) + 'px';
                }.bind(this));
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', $(this.$adSlot)).css('background-position', '50%' + this.scrollAmount);
                }.bind(this));
                break;
            case 'fixed matching fluid250':
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', $(this.$adSlot)).addClass('ad-exp--expand-scrolling-bg-fixed');
                }.bind(this));
                break;
            case 'parallax':
                fastdom.read(function () {
                    this.scrollAmount = Math.ceil((window.pageYOffset - this.$adSlot.offset().top) * 0.3 * -1) + 20;
                    this.scrollAmountP = this.scrollAmount + '%';
                }.bind(this));
                fastdom.write(function () {
                    $('.ad-exp--expand-scrolling-bg', $(this.$adSlot)).addClass('ad-exp--expand-scrolling-bg-parallax');
                    $('.ad-exp--expand-scrolling-bg', $(this.$adSlot)).css('background-position', '50%' + this.scrollAmountP);
                }.bind(this));
                break;
        }
    };

    ExpandableV3.prototype.listener = function () {
        fastdom.read(function () {
            if (!this.initialExpandCounter && (window.pageYOffset + bonzo.viewport().height) > (this.$adSlot.offset().top + this.openedHeight)) {
                fastdom.write(function () {
                    if (!storage.local.get('gu.commercial.expandable.' + this.params.ecid)) {
                        // expires in 1 week
                        var week = 1000 * 60 * 60 * 24 * 7;
                        storage.local.set('gu.commercial.expandable.' + this.params.ecid, true, { expires: Date.now() + week });
                        this.$button.addClass('button-spin');
                        $('.ad-exp__open-chevron').removeClass('chevron-up').addClass('chevron-down');
                        this.$ad.css('height', this.openedHeight);
                        this.isClosed = false;
                        this.initialExpandCounter = true;
                    } else if (this.isClosed) {
                        $('.ad-exp__open-chevron').addClass('chevron-up');
                    }
                }.bind(this));
                return true;
            }
        }.bind(this));
    };

    ExpandableV3.prototype.create = function () {
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
            $expandableV3 = $.create(template(expandableV3Tpl, { data: _.merge(this.params, showmoreArrow, showmorePlus, videoDesktop, scrollingbg) }));

        var domPromise = new Promise(function (resolve) {
            fastdom.write(function () {

                this.$ad     = $('.ad-exp--expand', $expandableV3).css('height', this.closedHeight);
                this.$button = $('.ad-exp__open', $expandableV3);

                $('.ad-exp-collapse__slide', $expandableV3).css('height', this.closedHeight);

                if (this.params.trackingPixel) {
                    this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
                }

                $expandableV3.appendTo(this.$adSlot);
                resolve();
            }.bind(this));
        }.bind(this));

        mediator.on('window:scroll', this.listener.bind(this));

        bean.on(this.$adSlot[0], 'click', '.ad-exp__open', function () {
            fastdom.write(function () {
                $('.ad-exp__close-button').toggleClass('button-spin');
                $('.ad-exp__open-chevron').removeClass('chevron-up').toggleClass('chevron-down');
                this.$ad.css('height', this.isClosed ? this.openedHeight : this.closedHeight);
                this.isClosed = !this.isClosed;
                this.initialExpandCounter = true;
            }.bind(this));
        }.bind(this));

        if (ExpandableV3.hasScrollEnabled) {
            // update bg position
            this.updateBgPosition();

            mediator.on('window:scroll', this.updateBgPosition.bind(this));
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition.bind(this));
        }

        return domPromise;
    };

    return ExpandableV3;

});
