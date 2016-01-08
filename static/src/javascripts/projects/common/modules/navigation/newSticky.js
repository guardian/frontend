define([
    'fastdom',
    'common/utils/$',
    'common/utils/mediator',
    'lodash/functions/bindAll',
    'common/utils/detect'
], function (
    fastdom,
    $,
    mediator,
    bindAll,
    detect) {

    function StickyHeader() {
        this.init();
    }

    StickyHeader.prototype.init = function () {
        if (detect.getBreakpoint() !== 'mobile') {
            fastdom.read(function () {
                this.$adBanner = $('.js-top-banner-above-nav');
                this.$header = $('.js-header');
                this.headerHeight = this.$header.height();
                this.adHeight = this.$adBanner.height();
            }.bind(this));

            fastdom.write(function () {
                this.$adBanner.css({
                    'width': '100%',
                    'z-index': '1020'
                });

                this.$header.css({
                    'z-index': '1019'
                });
            }.bind(this));

            bindAll(this, 'stickOrUnstick', 'updateHeights');

            mediator.on('window:throttledScroll', this.stickOrUnstick);
        }
    };

    StickyHeader.prototype.stickOrUnstick = function () {
        var css;
        this.updateHeights();
        if (window.scrollY > this.headerHeight) {
            css = {
                'position': 'absolute',
                'top': this.headerHeight + 'px'
            };
        } else {
            css = {
                'position': 'fixed',
                'top': 0
            };
        }

        fastdom.write(function () {
            this.$adBanner.css(css);
        }.bind(this));
    };

    StickyHeader.prototype.updateHeights = function () {
        if (window.scrollY < 300) {
            fastdom.read(function () {
                this.headerHeight = this.$header.height();
                this.adHeight = this.$adBanner.height();

                fastdom.write(function () {
                    this.$header.css({
                        'margin-top': this.adHeight + 'px'
                    });
                }.bind(this));
            }.bind(this));
        }
    };

    return new StickyHeader();
});
