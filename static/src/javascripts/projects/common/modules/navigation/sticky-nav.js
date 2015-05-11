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

    function showNavigation(scrollY, config, isDesktop) {
        if (scrollDirection(scrollY, config) === 'up') {
            config.$navigationScroll.css('display', 'block');
            if (isDesktop) {
                config.$navigationGreySection.css('border-top', '36px solid #00456e');
            }
        } else {
            config.$navigationScroll.css('display', 'none');
        }
    }

    function updatePosition(config) {
        fastdom.write(function () {
            if (window.scrollY < config.scrollThreshold) {
                //topAd is sticky from the beginning
                config.$stickyTopAd.css({
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    'z-index': '1001'
                });

                //navigation is not sticky yet, header is not slim
                config.$header.css({
                    position: null,
                    top: null,
                    'z-index': null,
                    'margin-top': config.stickyTopAdHeight
                }).removeClass('l-header--is-slim l-header--is-slim-ab');
                config.$bannerMobile.css('margin-top', null);

                //burger icon is below the header
                config.$burgerIcon.insertAfter(config.$navigationScroll);

                config.$stickyNavigation.css('display', 'block');

                //when scroll will pass 30px header is sticky and slim
                if (window.scrollY >= 30) {
                    //burger icon is located on the right side of logo
                    config.$burgerIcon.insertAfter(config.$logoWrapper);
                    config.$header.css({
                        position: 'fixed',
                        top: config.stickyTopAdHeight,
                        width: '100%',
                        'z-index': '1001',
                        'margin-top': 0
                    }).addClass('l-header--is-slim l-header--is-slim-ab');
                    config.$bannerMobile.css('margin-top', config.stickyNavigationHeight + config.stickyTopAdHeight);

                    //if we are scrolling up show full navigation
                    showNavigation(window.scrollY, config, true);
                }
            } else {
                //after config.scrollThreshold px of scrolling 'release' topAd
                config.$stickyTopAd.css({
                    position: 'absolute',
                    top: config.scrollThreshold
                });

                //move navigation toward top
                config.$header.css({
                    position: 'fixed',
                    top: config.stickyTopAdHeight - (window.scrollY - config.scrollThreshold)
                });

                //from now on, navigation stays on top
                if (window.scrollY > (config.scrollThreshold + config.stickyTopAdHeight)) {
                    config.$header.css({
                        position: 'fixed',
                        top: 0
                    });
                }

                //if we are scrolling up show full navigation
                showNavigation(window.scrollY, config, true);
            }
        });
    }

    function updatePositionMobile(config) {
        fastdom.write(function () {
            //header, navigation and banner are sticky from the beginning
            if (window.scrollY < config.scrollThreshold) {
                config.$header.css({
                    position: 'fixed',
                    top: config.stickyTopAdHeight,
                    width: '100%',
                    'z-index': '1001',
                    'margin-top': 0
                });
                config.$bannerMobile.css({
                    position:  'fixed',
                    top:       config.headerHeight,
                    width:     '100%',
                    'z-index': '1000'
                });
                config.$contentBelowMobile.css('margin-top', config.headerHeight + config.$bannerMobile.dim().height);

                config.$navigationScroll.css('display', 'block');
            } else {
                //after config.scrollThreshold px of scrolling 'release' banner and navigation
                config.$bannerMobile.css({
                    position:  'absolute',
                    top:       config.scrollThreshold
                });
                showNavigation(window.scrollY, config, false);
            }
        });
    }

    function stickyNavBurger(stickTill) {
        stickTill = stickTill || 480;

        fastdom.read(function () {
            var stickyConfig = {
                    $stickyNavigation: $('.sticky-nav-mt-test .navigation'),
                    $stickyTopAd: $('.sticky-nav-mt-test .top-banner-ad-container'),
                    $header: $('#header'),
                    $burgerIcon: $('.js-navigation-header .js-navigation-toggle'),
                    $bannerMobile: $('.top-banner-ad-container--mobile'),
                    $contentBelowMobile: $('#maincontent'),
                    $logoWrapper: $('.js-navigation-header .logo-wrapper'),
                    $navigationScroll: $('.js-navigation-header .navigation__scroll'),
                    $navigationGreySection: $('.js-navigation-header .navigation__container--first'),
                    scrollThreshold: config.page.contentType === 'Video' || config.page.contentType === 'Gallery' ? 280 : stickTill,
                    prevScroll: 0,
                    direction: ''
                };

            stickyConfig.stickyNavigationHeight = stickyConfig.$stickyNavigation.dim().height;

            if (detect.getBreakpoint() === 'mobile') {
                fastdom.write(function () {
                    //header and navigation are slim
                    stickyConfig.$header.addClass('l-header--is-slim l-header--is-slim-ab');

                    //burger icon is located on the right side of logo
                    stickyConfig.$burgerIcon.insertAfter(stickyConfig.$logoWrapper);
                    stickyConfig.$navigationScroll.css('display', 'block');
                    $('.sticky-nav-mt-test .l-header-main').css('overflow', 'hidden');
                    stickyConfig.headerHeight = stickyConfig.$header.dim().height;
                });
                updatePositionMobile(stickyConfig);

                mediator.on('window:scroll', _.throttle(function () {
                    updatePositionMobile(stickyConfig);
                }, 10));
            } else {
                mediator.on('window:scroll', _.throttle(function () {
                    //height of topAd needs to be recalculated because we don't know when we will get respond from DFP
                    stickyConfig.stickyTopAdHeight = stickyConfig.$stickyTopAd.dim().height;
                    updatePosition(stickyConfig);
                }, 10));
            }
        });
    }

    // Sticky navigation test with all header features visible in slim variant
    var stickyTresholds = {
        'mobile': 480,
        'desktop': {
            'slimnav': 100,
            'nobanner': 480
        }
    },
    $els = {};

    function stickyNavAll(stickTill) {
        stickTill = stickTill || stickyTresholds.desktop.nobanner;

        stickyTresholds.desktop.nobanner = stickTill;

        fastdom.read(function () {
            $els.header        = $('#header');
            $els.bannerDesktop = $('.top-banner-ad-container--above-nav');
            $els.bannerMobile  = $('.top-banner-ad-container--mobile');
            $els.main          = $('#maincontent');
            $els.navHeader     = $('.js-navigation-header');
        });

        fastdom.write(function () {
            if (detect.getBreakpoint() === 'mobile') {
                $els.bannerMobile.css({
                    position:  'fixed',
                    top:       $els.navHeader.dim().height,
                    width:     '100%',
                    'z-index': '10000'
                });
                $els.main.css('margin-top', $els.bannerMobile.dim().height);
            } else {

                // Make sure that we show slim nav when page loaded with anchor
                if (window.scrollY > stickyTresholds.desktop.slimnav) {
                    $els.header.css({
                        position:  'fixed',
                        top:       0,
                        width:     '100%',
                        'z-index': '10000'
                    });
                    $els.header.addClass('is-slim');
                }
            }
        });

        mediator.on('window:scroll', _.throttle(function () {
            updateStickyNavPosition();
        }, 10));
    }

    function updateStickyNavPosition() {
        var headerHeight  = $els.navHeader.dim().height,
            bannerHeight,
            scrollY;

        fastdom.read(function () {
            scrollY = $(window).scrollTop();
        });

        if (detect.getBreakpoint() === 'mobile') {
            fastdom.write(function () {
                if (scrollY > stickyTresholds.mobile) {
                    $els.bannerMobile.css({
                        position: 'absolute',
                        top:      stickyTresholds.mobile + headerHeight
                    });
                } else {
                    $els.bannerMobile.css({
                        position:  'fixed',
                        top:       headerHeight,
                        width:     '100%',
                        'z-index': '10000'
                    });
                    $els.header.css({
                        position:  'fixed',
                        top:       0,
                        width:     '100%',
                        'z-index': '10001'
                    });
                }
            });
        } else {
            fastdom.write(function () {
                bannerHeight = $els.bannerDesktop.dim().height;

                // Add is collapsed, header is slim
                if (scrollY > stickyTresholds.desktop.nobanner) {
                    // Add is not sticky anymore
                    $els.bannerDesktop.css({
                        position: 'absolute',
                        width: '100%',
                        top: stickyTresholds.desktop.nobanner
                    });

                    // Sync header movement with banner disapearing
                    $els.header.css({
                        top: Math.round(bannerHeight - (scrollY - stickyTresholds.desktop.nobanner))
                    });

                    // Banner is not visible anymore so stick header to the top of the viewport
                    if (scrollY > (stickyTresholds.desktop.nobanner + bannerHeight)) {
                        $els.header.css({
                            top: 0
                        });
                    }
                // Top ad and header are visible in full height
                } else {
                    // Make sure that banner and header are sticky
                    $els.bannerDesktop.css({
                        position:  'fixed',
                        top:       0,
                        width:     '100%',
                        'z-index': '10000'
                    });
                    $els.header.css({
                        position:  'fixed',
                        top:       bannerHeight,
                        width:     '100%',
                        'z-index': '10000'
                    });

                    // Make sure header is slim when needed
                    (scrollY > stickyTresholds.desktop.slimnav) ? $els.header.addClass('is-slim') : $els.header.removeClass('is-slim');
                }
            });
        }

        // Make sure there is always enough space so the content is below the sticky nav and banner
        fastdom.write(function () {
            if (detect.getBreakpoint() === 'mobile') {
                bannerHeight = $els.bannerMobile.dim().height;
            }
            $els.main.css('margin-top', headerHeight + bannerHeight);
        });
    }

    function updatePositionNoThr(config) {
        fastdom.write(function () {
            if (window.scrollY < config.scrollThreshold) {
                //topAd is sticky from the beginning
                config.$stickyTopAd.css({
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    'z-index': '1001'
                });

                //navigation is not sticky yet, header is not slim
                config.$header.css({
                    position: null,
                    top: null,
                    'z-index': null,
                    'margin-top': config.stickyTopAdHeight
                }).removeClass('l-header--is-slim l-header--is-slim-ab');
                config.$bannerMobile.css('margin-top', null);

                //burger icon is below the header
                config.$burgerIcon.insertAfter(config.$navigationScroll);

                config.$stickyNavigation.css('display', 'block');

                //while scrolling header is sticky and slim
                if (window.scrollY > 0) {
                    //burger icon is located on the right side of logo
                    config.$burgerIcon.insertAfter(config.$logoWrapper);
                    config.$header.css({
                        position: 'fixed',
                        top: config.stickyTopAdHeight,
                        width: '100%',
                        'z-index': '1001',
                        'margin-top': 0
                    }).addClass('l-header--is-slim l-header--is-slim-ab');

                    //if we are scrolling up show full navigation
                    showNavigation(window.scrollY, config, true);
                    config.$bannerMobile.css('margin-top', config.$navigationHeader.dim().height + config.stickyTopAdHeight);
                }
            } else {
                //after config.scrollThreshold px of scrolling 'release' topAd
                config.$stickyTopAd.css({
                    position: 'absolute',
                    top: config.scrollThreshold
                });

                //move navigation toward top
                config.$header.css({
                    position: 'fixed',
                    top: config.stickyTopAdHeight - (window.scrollY - config.scrollThreshold)
                });

                //from now on, navigation stays on top
                if (window.scrollY > (config.scrollThreshold + config.stickyTopAdHeight)) {
                    config.$header.css({
                        position: 'fixed',
                        top: 0
                    });
                }

                //if we are scrolling up show full navigation
                showNavigation(window.scrollY, config, true);
            }
        });
    }

    function stickyNavBurgerNoThr() {
        fastdom.read(function () {
            var stickyConfig = {
                $navigationHeader: $('.js-navigation-header .l-header__inner'),
                $stickyNavigation: $('.sticky-nav-mt-test .navigation'),
                $stickyTopAd: $('.sticky-nav-mt-test .top-banner-ad-container'),
                $header: $('#header'),
                $burgerIcon: $('.js-navigation-header .js-navigation-toggle'),
                $bannerMobile: $('.top-banner-ad-container--mobile'),
                $logoWrapper: $('.js-navigation-header .logo-wrapper'),
                $navigationScroll: $('.js-navigation-header .navigation__scroll'),
                $navigationGreySection: $('.js-navigation-header .navigation__container--first'),
                scrollThreshold: 10,
                prevScroll: 0,
                direction: ''
            };

            if (detect.getBreakpoint() === 'desktop' || detect.getBreakpoint() === 'wide') {
                mediator.on('window:scroll', _.throttle(function () {
                    //height of topAd needs to be recalculated because we don't know when we will get respond from DFP
                    stickyConfig.stickyTopAdHeight = stickyConfig.$stickyTopAd.dim().height;
                    updatePositionNoThr(stickyConfig);
                }, 10));
            }
        });
    }

    // Navigation slowly dissapearing
    function StickySlow() {
        this.$els = {};
    }

    StickySlow.prototype.init = function () {
        fastdom.read(function () {
            this.$els.header           = $('#header');
            this.$els.bannerDesktop    = $('.top-banner-ad-container--above-nav');
            this.$els.main             = $('#maincontent');
            this.$els.navHeader        = $('.js-navigation-header');
            this.$els.sticky           = $('.sticky-nav-mt-test');
            this.$els.burgerIcon       = $('.js-navigation-toggle', this.$els.navHeader);
            this.$els.logoWrapper      = $('.logo-wrapper', this.$els.navHeader);
            this.$els.navigationScroll = $('.navigation__scroll', this.$els.navHeader);
            this.headerBigHeight       = this.$els.navHeader.dim().height;
        }.bind(this));

        mediator.on('window:scroll', _.throttle(function () {
            this.updatePosition();
        }.bind(this), 10));
    };

    StickySlow.prototype.updatePosition = function () {
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

                //this.$els.main.css('margin-top', this.headerBigHeight + bannerHeight);
                this.$els.header.addClass('is-slim');
                this.$els.header.css('transform', 'translateY(0%)');

            } else if (scrollY >= this.headerBigHeight) {
                // Add is not sticky anymore
                this.$els.bannerDesktop.css({
                    position: 'absolute',
                    width: '100%',
                    top: this.headerBigHeight
                });

                //header is slim from now on
                this.$els.burgerIcon.insertAfter(this.$els.logoWrapper);
                this.$els.header.addClass('l-header--is-slim l-header--is-slim-ab');

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
                this.$els.burgerIcon.insertAfter(this.$els.navigationScroll);

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
        stickyNavBurger: stickyNavBurger,
        stickyNavAll: stickyNavAll,
        stickyNavBurgerNoThr: stickyNavBurgerNoThr,
        stickySlow: new StickySlow()
    };
});
