define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    fastdom,
    $,
    _,
    config,
    detect,
    mediator
) {
    // Sticky navigation test with very slim nav and burger all sections icon
    function scrollDirection(scrollY, config) {
        if (scrollY > config.prevScroll) {
            config.direction = 'down';
        } else if (scrollY < config.prevScroll) {
            config.direction = 'up';
        }
        config.prevScroll = scrollY;

        return config.direction;
    }

    // Navigation slowly dissapearing
    function StickySlow() {
        this.$els = {};
    }

    StickySlow.prototype.init = function () {
        var breakpoint = detect.getBreakpoint();
        fastdom.read(function () {
            this.$els.header                 = $('#header');
            this.$els.bannerDesktop          = $('.top-banner-ad-container--above-nav');
            this.$els.main                   = $('#maincontent');
            this.$els.navHeader              = $('.js-navigation-header');
            this.$els.sticky                 = $('.sticky-nav-mt-test');
            this.$els.burgerIcon             = $('.js-navigation-toggle', this.$els.navHeader);
            this.$els.logoWrapper            = $('.logo-wrapper', this.$els.navHeader);
            this.$els.navigationScroll       = $('.navigation__scroll', this.$els.navHeader);
            this.$els.$navigationScroll      = $('.navigation__scroll', this.$els.navHeader);
            this.$els.$navigationGreySection = $('.navigation__container--first', this.$els.navHeader);
            this.$els.navigation             = $('.navigation', this.$els.navHeader);
            this.$els.bannerMobile           = $('.top-banner-ad-container--mobile');
            this.headerBigHeight             = this.$els.navHeader.dim().height;
            this.thresholdMobile             = 400;
        }.bind(this));

        if (breakpoint === 'mobile') {
            mediator.on('window:scroll', _.throttle(function () {
                this.updatePositionMobile(breakpoint);
            }.bind(this), 10));
        } else {
            mediator.on('window:scroll', _.throttle(function () {
                this.updatePosition(breakpoint);
            }.bind(this), 10));
        }
    };

    StickySlow.prototype.showNavigation = function (scrollY, breakpoint) {
        if (scrollDirection(scrollY, this.$els) === 'up') {
            this.$els.$navigationScroll.css('display', 'block');
            if (breakpoint === 'desktop' || breakpoint === 'wide') {
                this.$els.$navigationGreySection.css('border-top', '36px solid #00456e');
                this.$els.burgerIcon.show();
                this.$els.header.removeClass('l-header--is-slim l-header--is-slim-ab');
            } else if (breakpoint === 'mobile' || breakpoint === 'tablet') {
                this.$els.navigation.css('height', null);
                if (breakpoint === 'tablet') {
                    this.$els.burgerIcon.show();
                    this.$els.header.removeClass('l-header--is-slim l-header--is-slim-ab');
                }
            }
        } else {
            this.$els.$navigationScroll.css('display', 'none');
            if (breakpoint === 'desktop' || breakpoint === 'wide') {
                this.$els.burgerIcon.hide();
                this.$els.header.addClass('l-header--is-slim l-header--is-slim-ab');
            } else if (breakpoint === 'mobile' || breakpoint === 'tablet') {
                this.$els.navigation.css('height', 0);
                if (breakpoint === 'tablet') {
                    this.$els.burgerIcon.hide();
                    this.$els.header.addClass('l-header--is-slim l-header--is-slim-ab');
                }
            }
        }
    };

    StickySlow.prototype.updatePositionMobile = function (breakpoint) {
        var bannerHeight = this.$els.bannerMobile.dim().height,
            scrollY;

        fastdom.read(function () {
            scrollY = $(window).scrollTop();
        });

        fastdom.write(function () {
            //header, navigation and banner are sticky from the beginning
            if (scrollY < this.thresholdMobile) {
                this.$els.header.css({
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    'z-index': '1001',
                    'margin-top': 0
                });
                this.$els.bannerMobile.css({
                    position:  'fixed',
                    top:       this.headerBigHeight,
                    width:     '100%',
                    'z-index': '1000'
                });
                this.$els.main.css('margin-top', this.headerBigHeight + bannerHeight);

                this.$els.$navigationScroll.css('display', 'block');
            } else {
                //after this.thresholdMobile px of scrolling 'release' banner and navigation
                this.$els.bannerMobile.css({
                    position:  'absolute',
                    top:       this.thresholdMobile
                });
                this.showNavigation(scrollY, breakpoint);
            }
        }.bind(this));
    };

    StickySlow.prototype.updatePosition = function (breakpoint) {
        var bannerHeight = this.$els.bannerDesktop.dim().height,
            scrollY;

        fastdom.read(function () {
            scrollY = $(window).scrollTop();
        });

        fastdom.write(function () {
            if (scrollY >= this.headerBigHeight + bannerHeight) {
                this.$els.header.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '10000',
                    'margin-top': 0,
                    'transform': 'translateY(-100%)'
                });

                this.$els.header.addClass('is-slim');
                this.$els.header.css('transform', 'translateY(0%)');
                this.showNavigation(scrollY, breakpoint);
            } else if (scrollY >= this.headerBigHeight) {
                // Add is not sticky anymore
                this.$els.bannerDesktop.css({
                    position: 'absolute',
                    width: '100%',
                    top: this.headerBigHeight
                });

                //header is slim from now on
                this.$els.header.addClass('l-header--is-slim l-header--is-slim-ab');
                this.$els.burgerIcon.hide();

                this.$els.header.css({
                    position:  'static',
                    'margin-top': bannerHeight,
                    'transform': 'translateY(-500%)'
                });
                this.$els.header.removeClass('is-slim');
                this.$els.main.css('margin-top', this.headerBigHeight - this.$els.header.dim().height);
            } else {
                // Make sure that we show slim nav when page loaded with anchor
                this.$els.bannerDesktop.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '10000'
                });
                //header is not slim yet
                this.$els.header.removeClass('l-header--is-slim l-header--is-slim-ab');
                this.$els.burgerIcon.show();

                this.$els.header.removeClass('is-slim');
                this.$els.header.css({
                    position:  'static',
                    width:     '100%',
                    'margin-top': bannerHeight,
                    'transform': 'translateY(0%)'
                });

                this.$els.main.css('margin-top', 0);
            }

        }.bind(this));
    };

    return {
        stickySlow: new StickySlow()
    };
});
