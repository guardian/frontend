define([
    'bean',
    'qwery',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/experiments/ab',
    'common/modules/ui/smartAppBanner',
    'common/modules/commercial/adblock-messages',
    'common/modules/commercial/commercial-features',
    'lodash/collections/contains',
    'lodash/functions/bindAll'
], function (
    bean,
    qwery,
    fastdom,
    $,
    config,
    detect,
    mediator,
    ab,
    smartAppBanner,
    adblockMsg,
    commercialFeatures,
    contains,
    bindAll) {
    function StickyHeader() {
        this.breakpoint = detect.getBreakpoint();

        // temporarily disable on mobile and top banner test
        if (this.breakpoint === 'mobile'
            && config.switches.disableStickyNavOnMobile) {
            return;
        }

        this.$els   = {};
        this.config = {
            showHeaderDepth: 0.5,
            showHeaderAppleDepth: 0.3,
            showNavigationDepth: 150, // Navigation will show when user scrolls X px up
            distance: 0,
            direction: 'down',
            showNavigation: false,
            thresholdMobile: 400,
            firstLoadDepth: 500,
            isNavigationLocked: false
        };
        this.isMobile = contains(this.breakpoint, 'mobile');
        this.isTablet = contains(this.breakpoint, 'tablet');
        this.isAppleCampaign = config.page.hasBelowTopNavSlot;
        this.inTopBannerAbTest = config.tests && config.tests.mcTopBannerPosition;
        this.noTopBanner = !commercialFeatures.topBannerAd || adblockMsg.noAdblockMsg() || this.inTopBannerAbTest;
        this.isProfilePage = config.page.section === 'identity';

        bindAll(this, 'updatePositionMobile', 'updatePositionAdblock', 'updatePositionApple', 'updatePosition');
    }

    StickyHeader.prototype.init = function () {
        // temporarily disable on mobile
        if (this.breakpoint === 'mobile' && config.switches.disableStickyNavOnMobile) {
            return;
        }

        this.$els.header           = $('.js-header');
        this.$els.bannerDesktop    = $('.js-top-banner-above-nav');
        this.$els.bannerMobile     = $('.js-top-banner-mobile');
        this.$els.bannerBelowNav   = $('.js-top-banner-below-nav');
        this.$els.main             = $('.js-maincontent');
        this.$els.navHeader        = $('.js-navigation-header');
        this.$els.burgerIcon       = $('.js-navigation-toggle', this.$els.navHeader);
        this.$els.navigation       = $('.js-navigation', this.$els.navHeader);
        this.$els.navigationGlobal = $('.js-global-navigation');
        this.$els.popupSearch      = $('.js-popup--search');
        this.$els.window           = $(window);

        fastdom.read(function () {
            this.headerBigHeight     = this.$els.navHeader.height();
            this.navigationClassList = this.$els.navigation.attr('class');
        }.bind(this));

        // Top ads are revealed with CSS animation. As we don't know when animation is finished we will
        // start updating position only if the viewport is 'firstLoadDepth' scrolled down on page load
        if (this.$els.window.scrollTop() > this.config.firstLoadDepth) {
            if (this.isAppleCampaign) {
                fastdom.read(this.updatePositionApple);
            } else {
                fastdom.read(this.updatePosition);
            }
        }

        // If non paying member uses adblock
        // the adblock banner should behave like standard top banner
        if (adblockMsg.showAdblockMsg()) {
            fastdom.write(function () {
                fastdom.read(function () {
                    this.$els.bannerDesktop = $('.js-adblock-sticky');
                }.bind(this));
            }.bind(this));
        }

        // Get the name of the method to run after scroll
        this.updateMethod = this.getUpdateMethod();

        // Profile page doesn't need scroll event as it has only slim sticky nav from the beginning
        if (this.isProfilePage) {
            this.updatePositionProfile();
        } else {
            mediator.on('window:throttledScroll', this[this.updateMethod]);
        }

        // Make sure header is locked when meganav is open
        mediator.on('modules:nav:open', function () {
            this.lockStickyNavigation();
        }.bind(this));

        mediator.on('modules:nav:close', function () {
            this.unlockStickyNavigation();
        }.bind(this));

        // Make sure header is locked when search is open
        mediator.on('modules:search', function () {
            if (this.$els.popupSearch.hasClass('is-off')) {
                this.unlockStickyNavigation();
            } else {
                this.lockStickyNavigation();
            }
        }.bind(this));
    };

    StickyHeader.prototype.getUpdateMethod = function () {
        if (this.isMobile) {
            return 'updatePositionMobile';
        } else if (adblockMsg.noAdblockMsg() || this.inTopBannerAbTest) { // if paying member uses adblock, dont show the messages
            return 'updatePositionAdblock';
        } else if (this.isAppleCampaign) {
            return 'updatePositionApple';
        } else {
            return 'updatePosition';
        }
    };

    // Make sure meganav is always in the default state
    StickyHeader.prototype.unlockStickyNavigation = function () {
        this.config.isNavigationLocked = false;

        fastdom.write(function () {
            this.$els.navigationGlobal
                .removeClass('navigation__expandable--sticky')
                .attr('height', 'auto');
        }.bind(this));
    };

    StickyHeader.prototype.lockStickyNavigation = function () {
        this.config.isNavigationLocked = true;

        fastdom.read(function () {

            // Navigation should have scrollbar only if header is in slim version
            // Or we are in mobile and tablet version
            if (this.$els.header.hasClass('l-header--is-slim') || this.isMobile || this.isTablet) {
                var height = window.innerHeight - $('.js-mega-nav-placeholder')[0].getBoundingClientRect().top;

                fastdom.write(function () {
                    this.$els.navigationGlobal
                        .addClass('navigation__expandable--sticky')
                        .css('height', height);
                }.bind(this));
            }
        }.bind(this));
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
            fastdom.write(function () {
                if (this.isTablet || this.isMobile) {
                    this.$els.navigation.removeClass('animate-down-mobile').addClass('animate-up-mobile');
                } else {
                    if (this.noTopBanner) {
                        this.$els.navigation.css('display', 'block');
                    } else {
                        this.$els.navigation.removeClass('animate-down-desktop').addClass('animate-up-desktop');
                    }
                }
            }.bind(this));
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
            fastdom.write(function () {
                if (this.isTablet || this.isMobile) {
                    this.$els.navigation.removeClass('animate-up-mobile').addClass('animate-down-mobile');
                } else {
                    if (this.noTopBanner) {
                        this.$els.navigation.css('display', 'none');
                    } else {
                        this.$els.navigation.removeClass('animate-up-desktop').addClass('animate-down-desktop');
                    }
                }
            }.bind(this));
        }
    };

    StickyHeader.prototype.setNavigationDefault = function () {
        fastdom.write(function () {
            // Make sure navigation is visible and has its default styles
            this.$els.navigation.removeAttr('class');
            this.$els.navigation.attr('class', this.navigationClassList);
        }.bind(this));
    };

    StickyHeader.prototype.updatePosition = function () {
        var bannerHeight = 0,
            scrollY = window.pageYOffset;

        if (!this.noTopBanner) {
            bannerHeight = this.$els.bannerDesktop.height() || 128;
        }

        this.setScrollDirection(scrollY);

        var $appBanner = $('.site-message--ios, .site-message--android');
        var appBannerHeight = $appBanner.height();

        // Header is slim and navigation is shown on the scroll up
        // Unless meganav is opened
        if ((scrollY >= this.headerBigHeight + (bannerHeight * this.config.showHeaderDepth) + appBannerHeight)
            && !this.config.isNavigationLocked) {
            fastdom.write(function () {
                this.$els.header.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '1020',
                    'margin-top': 0,
                    'backface-visibility': 'hidden'
                });

                // Make sure banner is outside of the view
                this.$els.bannerDesktop.css({
                    position: 'absolute',
                    width: '100%',
                    top: this.headerBigHeight + appBannerHeight
                });

                this.$els.main.css('margin-top', this.headerBigHeight + bannerHeight);
                this.$els.header.addClass('l-header--is-slim');
                this.$els.header.css({
                    '-webkit-transform': 'translateY(0%)',
                    '-ms-transform': 'translateY(0%)',
                    'transform': 'translateY(0%)'
                });
            }.bind(this));

            // If meganav is open we don't want to touch the navigation state
            if (!this.config.isNavigationLocked && config.page.contentType !== 'Interactive') {
                this.showNavigation(scrollY);
            }
        } else if (scrollY >= this.headerBigHeight + appBannerHeight) {
            fastdom.write(function () {
                // Add is not sticky anymore
                this.$els.bannerDesktop.css({
                    position: 'absolute',
                    width: '100%',
                    top: this.headerBigHeight + appBannerHeight,
                    'z-index': '1019' // Sticky z-index +1 so banner is over sticky header
                });

                if (!this.config.isNavigationLocked) {
                    //header is slim from now on
                    this.$els.header.addClass('l-header--is-slim');
                }
            }.bind(this));
            if (!this.config.isNavigationLocked) {
                if (this.config.direction === 'up') {
                    fastdom.write(function () {
                        this.$els.header.css({
                            '-webkit-transform': 'translateY(-100%)',
                            '-ms-transform': 'translateY(-100%)',
                            'transform': 'translateY(-100%)'
                        });
                    }.bind(this));
                } else {
                    fastdom.write(function () {
                        this.$els.header.css({
                            position: 'absolute',
                            'margin-top': bannerHeight,
                            '-webkit-transform': 'translateY(-500%)',
                            '-ms-transform': 'translateY(-500%)',
                            'transform': 'translateY(-500%)',
                            'z-index': '1018'
                        });

                        this.$els.main.css('margin-top', this.headerBigHeight + bannerHeight);
                    }.bind(this));
                }
            }
        } else {
            fastdom.write(function () {
                // Only apply sticky when scrolled past the site message, if there is one
                if (window.scrollY > appBannerHeight) {
                    // Make sure that we show slim nav when page loaded with anchor
                    this.$els.bannerDesktop.css({
                        position:  'fixed',
                        top:       0,
                        width:     '100%',
                        'z-index': '1019',
                        'backface-visibility': 'hidden'
                    });
                    //Header is slim only on interactives page
                    if (config.page.contentType !== 'Interactive') {
                        this.$els.header.removeClass('l-header--is-slim');
                    }

                    this.$els.header.css({
                        position:  'relative',
                        width:     '100%',
                        'margin-top': bannerHeight,
                        '-webkit-transform': 'translateY(0%)',
                        '-ms-transform': 'translateY(0%)',
                        'transform': 'translateY(0%)',
                        'z-index': '1018'
                    });

                    this.$els.main.css('margin-top', 0);
                    if (this.noTopBanner) {
                        this.$els.navigation.css('display', 'block');
                    }
                } else {
                    // Reset
                    this.$els.bannerDesktop.css({
                        position: '',
                        top: '',
                        width: '',
                        'z-index': '',
                        'backface-visibility': ''
                    });

                    this.$els.header.css({
                        position: '',
                        width: '',
                        'margin-top': '',
                        '-webkit-transform': '',
                        '-ms-transform': '',
                        'transform': '',
                        'z-index': ''
                    });

                    this.$els.main.css('margin-top', '');

                    if (this.noTopBanner) {
                        this.$els.navigation.css('display', '');
                    }
                }
            }.bind(this));

            // Put navigation to its default state
            this.setNavigationDefault();
        }

        if ($('.gssb_c').length > 0) {
            fastdom.write(function () {
                $('.gssb_c').hide();
            });
        }
    };

    StickyHeader.prototype.updatePositionProfile = function () {
        var headerHeight = this.$els.header.height();
        fastdom.write(function () {
            this.$els.header.css({
                position:  'fixed',
                top:       0,
                width:     '100%',
                'z-index': '1020',
                'margin-top': 0,
                'backface-visibility': 'hidden'
            });
            this.$els.main.css('padding-top', headerHeight);
        }.bind(this));
    };

    StickyHeader.prototype.updatePositionAdblock = function () {
        var headerHeight = this.$els.header.height(),
            scrollY      = window.pageYOffset;

        this.setScrollDirection(scrollY);
        // Header is slim and navigation is shown on the scroll up
        if (scrollY >= headerHeight) {
            fastdom.write(function () {
                this.$els.header.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '1000',
                    'margin-top': 0,
                    '-webkit-transform': 'translateY(-100%)',
                    '-ms-transform': 'translateY(-100%)',
                    'transform': 'translateY(-100%)',
                    'backface-visibility': 'hidden'
                });

                this.$els.header.addClass('l-header--is-slim');
                this.$els.header.css({
                    '-webkit-transform': 'translateY(0%)',
                    '-ms-transform': 'translateY(0%)',
                    'transform': 'translateY(0%)'
                });
                this.$els.main.css('margin-top', this.headerBigHeight);
            }.bind(this));
            this.showNavigation(scrollY);
        } else {
            fastdom.write(function () {
                // Header is not slim yet
                this.$els.header.removeClass('l-header--is-slim');
                this.$els.header.css({
                    position:  'relative',
                    width:     '100%',
                    'margin-top': 0,
                    '-webkit-transform': 'translateY(0%)',
                    '-ms-transform': 'translateY(0%)',
                    'transform': 'translateY(0%)',
                    'z-index': '998'
                });
                this.$els.main.css('margin-top', 0);
            }.bind(this));

            // Put navigation to its default state
            this.setNavigationDefault();
        }
    };

    StickyHeader.prototype.updatePositionApple = function () {
        var bannerHeight = this.$els.bannerBelowNav.height() || 336,
            scrollY      = window.pageYOffset;

        this.setScrollDirection(scrollY);

        // Header is slim and navigation is shown on the scroll up
        if (scrollY >= bannerHeight * this.config.showHeaderAppleDepth) {
            fastdom.write(function () {
                this.$els.header.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '1020',
                    'margin-top': 0,
                    '-webkit-transform': 'translateY(-100%)',
                    '-ms-transform': 'translateY(-100%)',
                    'transform': 'translateY(-100%)',
                    'backface-visibility': 'hidden'
                });

                // Make sure banner is outside of the view
                this.$els.bannerBelowNav.css({
                    position:  'static',
                    top:       null,
                    width:     '100%',
                    'z-index': '1019'
                });
                this.$els.header.addClass('l-header--is-slim');
                this.$els.header.css({
                    '-webkit-transform': 'translateY(0%)',
                    '-ms-transform': 'translateY(0%)',
                    'transform': 'translateY(0%)'
                });
            }.bind(this));
            this.showNavigation(scrollY);
        } else {
            fastdom.write(function () {
                // Header is not slim yet
                this.$els.header.removeClass('l-header--is-slim');
                this.$els.header.css({
                    position:  'static',
                    width:     '100%',
                    'margin-top': 0,
                    '-webkit-transform': 'translateY(0%)',
                    '-ms-transform': 'translateY(0%)',
                    'transform': 'translateY(0%)',
                    'z-index': '1018'
                });
            }.bind(this));

            // Put navigation to its default state
            this.setNavigationDefault();
        }
    };

    StickyHeader.prototype.fixedBannerMobile = function (headerTop, bannerHeight) {
        fastdom.write(function () {
            this.$els.header.css({
                position: 'fixed',
                top: headerTop,
                width: '100%',
                'z-index': '1021',
                'margin-top': 0,
                'backface-visibility': 'hidden'
            });
            this.$els.bannerMobile.css({
                position: 'fixed',
                top: this.headerBigHeight + headerTop,
                width: '100%',
                'z-index': '1019', // Sticky z-index -1 as it should be sticky but should go below the sticky header,
                'backface-visibility': 'hidden'
            });
            this.$els.main.css('margin-top', this.headerBigHeight + bannerHeight);
        }.bind(this));
    };

    StickyHeader.prototype.updatePositionMobile = function () {
        var bannerHeight      = this.$els.bannerMobile.height(),
            scrollY           = window.pageYOffset,
            smartBannerHeight = smartAppBanner.getMessageHeight();

        fastdom.write(function () {
            this.setScrollDirection(scrollY);

            if (smartAppBanner.isMessageShown()) {
                if (scrollY < smartBannerHeight) {
                    fastdom.write(function () {
                        this.$els.header.css({
                            position: 'static',
                            top: null,
                            width: '100%',
                            'z-index': '1021',
                            'margin-top': 0
                        });
                        this.$els.bannerMobile.css({
                            position: 'static',
                            top: null,
                            width: '100%',
                            'z-index': '1019' // Sticky z-index -1 as it should be sticky but should go below the sticky header
                        });
                        this.$els.main.css('margin-top', 0);
                    }.bind(this));
                } else if (scrollY > smartBannerHeight && scrollY < this.config.thresholdMobile) {
                    fastdom.write(function () {
                        this.fixedBannerMobile(0, bannerHeight);
                    }.bind(this));
                    // Put navigation to its default state
                    this.setNavigationDefault();
                } else if (scrollY > this.config.thresholdMobile) {
                    fastdom.write(function () {
                        //after this.thresholdMobile px of scrolling 'release' banner and navigation
                        this.$els.bannerMobile.css({
                            position: 'absolute',
                            top: this.config.thresholdMobile + this.headerBigHeight
                        });
                    }.bind(this));

                    this.showNavigation(scrollY);
                }
            } else {
                //header, navigation and banner are sticky from the beginning
                if (scrollY < this.config.thresholdMobile) {
                    fastdom.write(function () {
                        this.fixedBannerMobile(0, bannerHeight);
                    }.bind(this));
                    // Put navigation to its default state
                    this.setNavigationDefault();
                } else {
                    fastdom.write(function () {
                        //after this.thresholdMobile px of scrolling 'release' banner and navigation
                        this.$els.bannerMobile.css({
                            position: 'absolute',
                            top: this.config.thresholdMobile + this.headerBigHeight
                        });
                    }.bind(this));

                    this.showNavigation(scrollY);
                }
            }
        }.bind(this));
    };

    return new StickyHeader();
});
