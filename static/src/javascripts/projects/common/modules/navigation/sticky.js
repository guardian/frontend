define([
    'bean',
    'qwery',
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bean,
    qwery,
    fastdom,
    $,
    _,
    config,
    detect,
    mediator
) {
    function StickyHeader() {
        this.$els   = {};
        this.config = {
            showHeaderDepth: 0.5,
            showNavigationDepth: 150, // Navigation will show when user scrolls X px up
            distance: 0,
            direction: 'down',
            showNavigation: false,
            thresholdMobile: 400,
            firstLoadDepth: 500
        };
        this.breakpoint = detect.getBreakpoint();
        this.isMobile = _.contains(this.breakpoint, 'mobile');
        this.isTablet = _.contains(this.breakpoint, 'tablet');
    }

    StickyHeader.prototype.init = function () {
        fastdom.read(function () {
            this.$els.header         = $('#header');
            this.$els.bannerDesktop  = $('.top-banner-ad-container--above-nav');
            this.$els.bannerMobile   = $('.top-banner-ad-container--mobile');
            this.$els.main           = $('#maincontent');
            this.$els.navHeader      = $('.js-navigation-header');
            this.$els.burgerIcon     = $('.js-navigation-toggle', this.$els.navHeader);
            this.$els.logoWrapper    = $('.logo-wrapper', this.$els.navHeader);
            this.$els.navigation     = $('.navigation', this.$els.navHeader);
            this.headerBigHeight     = this.$els.navHeader.dim().height;
            this.navigationClassList = this.$els.navigation.attr('class');

            console.log(this.navigationClassList);

            // Top ads are revealed with CSS animation. As we don't know when animation is finished we will
            // start updating position only if the viewport is 'firstLoadDepth' scrolled down on page load
            if ($(window).scrollTop() > this.config.firstLoadDepth) {
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

        // Make sure sticky header has sticky nav
        mediator.on('modules:nav:open', function () {
            this.showStickyNavigation();
        }.bind(this));
    };

    StickyHeader.prototype.showStickyNavigation = function () {
        var height = window.innerHeight - $('.js-global-navigation').offset().top;

        $('.js-global-navigation')
            .addClass('navigation__expandable--sticky')
            .css('height', height);
    };

    StickyHeader.prototype.setScrollDirection = function (scrollY) {
        this.config.direction = (scrollY > this.config.prevScroll) ? 'down' : 'up';
        this.config.prevScroll = scrollY;
    };

    StickyHeader.prototype.shouldShowNavigation = function (scrollY) {
        if (this.config.direction === 'up' && this.config.distance === 0) {
            this.config.distance = scrollY;
        }

        // If distance scrolled is more than showNavigationDepth show navigation
        this.config.showNavigation = (Math.abs(scrollY - this.config.distance) > this.config.showNavigationDepth);
    };

    StickyHeader.prototype.showNavigation = function (scrollY) {
        this.shouldShowNavigation(scrollY);

        // If user is scrolling up and navigation threshold was met show navigation
        if (this.config.direction === 'up' && this.config.showNavigation) {
            if (this.isTablet || this.isMobile) {
                this.$els.navigation.removeClass('animate-down-mobile').addClass('animate-up-mobile');
            } else {
                this.$els.navigation.removeClass('animate-down-desktop').addClass('animate-up-desktop');
            }

        } else {
            // If user is scrolling down and navigation is visible reset bounce distance
            if (this.config.showNavigation) {
                // Reset distance bouncing
                this.config.distance = 0;

                // Close meganav if it's open
                if (this.$els.navHeader.hasClass('navigation-container--expanded')) {
                    bean.fire(qwery('.js-navigation-toggle')[0], 'click');
                }
            }

            if (this.isTablet || this.isMobile) {
                this.$els.navigation.removeClass('animate-up-mobile').addClass('animate-down-mobile');
            } else {
                this.$els.navigation.removeClass('animate-up-desktop').addClass('animate-down-desktop');
            }
        }
    };

    StickyHeader.prototype.setNavigationDefault = function () {
        // Make sure navigation is visible and has its default styles
        this.$els.navigation.removeAttr('class');
        this.$els.navigation.attr('class', this.navigationClassList);
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
                    top: this.headerBigHeight,
                    'z-index': '999' // Sticky z-index +1 so banner is over sticky header
                });

                //header is slim from now on
                this.$els.header.addClass('l-header--is-slim');

                if (this.config.direction === 'up') {
                    this.$els.header.css('transform', 'translateY(-100%)');
                } else {
                    // Make sure navigation is hidden
                    this.$els.navigation.removeClass('animate-up').addClass('animate-down');

                    this.$els.header.css({
                        position:  'relative',
                        'margin-top': bannerHeight,
                        'transform': 'translateY(-500%)',
                        'z-index': '998'
                    });

                    this.$els.main.css('margin-top', this.headerBigHeight - this.$els.header.dim().height);
                }
            } else {
                // Make sure that we show slim nav when page loaded with anchor
                this.$els.bannerDesktop.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '999'
                });
                // Header is not slim yet
                this.$els.header.removeClass('l-header--is-slim');

                // Put navigation to its default state
                this.setNavigationDefault();

                this.$els.header.css({
                    position:  'relative',
                    width:     '100%',
                    'margin-top': bannerHeight,
                    'transform': 'translateY(0%)',
                    'z-index': '998'
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
                    'z-index': '999' // Sticky z-index -1 as it should be sticky but should go below the sticky header
                });
                this.$els.main.css('margin-top', this.headerBigHeight + bannerHeight);

                // Put navigation to its default state
                this.setNavigationDefault();
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
