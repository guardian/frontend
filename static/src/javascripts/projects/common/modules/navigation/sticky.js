define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bean,
    fastdom,
    $,
    _,
    config,
    detect,
    mediator
) {
    // Sticky navigation test with very slim nav and burger all sections icon
    /*function scrollDirection(scrollY, config) {
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

    StickySlow.prototype.init = function (variant) {
        var breakpoint = detect.getBreakpoint(),
            desktopCallback = (variant === 2) ? 'updatePositionVariantB' : 'updatePosition';
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
                this[desktopCallback](breakpoint);
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

                this.$els.main.css('margin-top', this.headerBigHeight + bannerHeight);
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

    StickySlow.prototype.updatePositionVariantB = function () {
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
                    'margin-top': 0
                });

                this.$els.main.css('margin-top', this.headerBigHeight + bannerHeight);
                this.$els.header.addClass('l-header--is-slim l-header--is-slim-ab');
                //this.$els.navigation.hide();
                this.$els.header.css('transform', 'translateY(0%)');
            } else if (scrollY >= this.headerBigHeight) {
                // Add is not sticky anymore
                this.$els.bannerDesktop.css({
                    position: 'absolute',
                    width: '100%',
                    top: this.headerBigHeight
                });
                this.$els.header.css({
                    position:  'static',
                    'margin-top': bannerHeight,
                    'transform': 'translateY(-500%)'
                });
                this.$els.header.removeClass('l-header--is-slim l-header--is-slim-ab');
                this.$els.burgerIcon.insertAfter(this.$els.logoWrapper);
                this.$els.main.css('margin-top', 0);
            } else {
                // Make sure that we show slim nav when page loaded with anchor
                this.$els.bannerDesktop.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '10000'
                });
                this.$els.header.removeClass('l-header--is-slim l-header--is-slim-ab');
                this.$els.header.css({
                    position:  'static',
                    width:     '100%',
                    'margin-top': bannerHeight,
                    'transform': 'translateY(0%)'
                });
                this.$els.burgerIcon.insertAfter(this.$els.navigationScroll);
            }

        }.bind(this));
    };*/

    function StickyHeader() {
        this.$els   = {};
        this.config = {
            showHeaderDepth: 0.5,
            showNavigationDepth: 100, // Navigation will show when user scrolls X px up
            distance: 0,
            direction: 'down',
            showNavigation: false,
            thresholdMobile: 400
        };
        this.breakpoint = detect.getBreakpoint();
        this.isMobile = _.contains(this.breakpoint, 'mobile');
    }

    StickyHeader.prototype.init = function () {
        fastdom.read(function () {
            this.$els.header                = $('#header');
            this.$els.bannerDesktop         = $('.top-banner-ad-container--above-nav');
            this.$els.bannerMobile          = $('.top-banner-ad-container--mobile');
            this.$els.main                  = $('#maincontent');
            this.$els.navHeader             = $('.js-navigation-header');
            this.$els.sticky                = $('.sticky-nav-mt-test');
            this.$els.burgerIcon            = $('.js-navigation-toggle', this.$els.navHeader);
            this.$els.logoWrapper           = $('.logo-wrapper', this.$els.navHeader);
            this.$els.navigationGreySection = $('.navigation__container--first', this.$els.navHeader);
            this.$els.navigation            = $('.navigation', this.$els.navHeader);
            this.headerBigHeight            = this.$els.navHeader.dim().height;

            if (!this.isMobile) {
                this.updatePosition();
            }
        }.bind(this));

        if (this.isMobile) {
            mediator.on('window:scroll', _.throttle(function () {
                this.updatePositionMobile();
            }.bind(this), 10));
        } else {
            mediator.on('window:scroll', _.throttle(function () {
                this.updatePosition();
            }.bind(this), 10));
        }
    };

    StickyHeader.prototype.setScrollDirection = function (scrollY) {
        this.config.direction = (scrollY > this.config.prevScroll) ? 'down' : 'up';
        this.config.prevScroll = scrollY;
    };

    StickyHeader.prototype.shouldShowNavigation = function (scrollY) {
        if (this.config.direction === 'up' && this.config.distance === 0) {
            this.config.distance = scrollY;
        }

        // If distance scolled is more than showNavigationDepth show navigation
        this.config.showNavigation = (Math.abs(scrollY - this.config.distance) > this.config.showNavigationDepth);
    };

    StickyHeader.prototype.showNavigation = function (scrollY) {
        this.shouldShowNavigation(scrollY);

        // If user is scrolling up and navigation threshold was met show navigation
        if (this.config.direction === 'up' && this.config.showNavigation) {
            this.$els.navigation.css('display', 'block');
        } else {
            // If user is scrolling down and navigation is visible reset bounce distance
            if (this.config.showNavigation) {
                // Reset distance bouncing
                this.config.distance = 0;

                // TODO: close meganav on scroll down
                /*if (this.$els.burgerIcon.hasClass('navigation-container--expanded')) {
                    console.log('fire');
                    bean.fire(document, 'click', '.js-navigation-toggle');
                }*/
            }

            this.$els.navigation.css('display', 'none');
        }
    };

    StickyHeader.prototype.updatePosition = function (breakpoint) {
        var bannerHeight = this.$els.bannerDesktop.dim().height || 128,
            scrollY;

        fastdom.read(function () {
            scrollY = $(window).scrollTop();
        });

        fastdom.write(function () {
            this.setScrollDirection(scrollY);

            // Header is slim and navigation is shown on the scroll up
            if (scrollY >= this.headerBigHeight + (bannerHeight * this.config.showHeaderDepth)) {
                this.$els.header.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '1000',
                    'margin-top': 0,
                    'transform': 'translateY(-100%)'
                });

                // Make sure banner is outside of the view
                this.$els.bannerDesktop.css({
                    position: 'absolute',
                    width: '100%',
                    top: this.headerBigHeight
                });

                this.$els.main.css('margin-top', this.headerBigHeight + bannerHeight);
                this.$els.header.addClass('l-header--is-slim');
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
                this.$els.header.addClass('l-header--is-slim');

                if (this.config.direction === 'up') {
                    this.$els.header.css('transform', 'translateY(-100%)');
                } else {
                    // Make sure navigation is hidden
                    this.$els.navigation.css('display', 'none');

                    this.$els.header.css({
                        position:  'static',
                        'margin-top': bannerHeight,
                        'transform': 'translateY(-500%)'
                    });

                    this.$els.main.css('margin-top', this.headerBigHeight - this.$els.header.dim().height);
                }
            } else {
                // Make sure that we show slim nav when page loaded with anchor
                this.$els.bannerDesktop.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '1000'
                });
                //header is not slim yet
                this.$els.header.removeClass('l-header--is-slim');

                // Make sure navigation is visible
                this.$els.navigation.css('display', 'block');

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

    StickyHeader.prototype.updatePositionMobile = function () {
        var bannerHeight = this.$els.bannerMobile.dim().height,
            scrollY;

        fastdom.read(function () {
            scrollY = $(window).scrollTop();
        });

        fastdom.write(function () {
            this.setScrollDirection(scrollY);

            //header, navigation and banner are sticky from the beginning
            if (scrollY < this.config.thresholdMobile) {
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
                this.$els.navigation.css('display', 'block');
            } else {
                //after this.thresholdMobile px of scrolling 'release' banner and navigation
                this.$els.bannerMobile.css({
                    position:  'absolute',
                    top:       this.config.thresholdMobile + this.headerBigHeight
                });
                this.showNavigation(scrollY);
            }
        }.bind(this));
    };

    return new StickyHeader();
});
