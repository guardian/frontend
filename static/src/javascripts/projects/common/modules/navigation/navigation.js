define([
    'bean',
    'qwery',
    'fastdom',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/$'
], function (
    bean,
    qwery,
    fastdom,
    mediator,
    detect,
    $
) {
    var stickyTresholds = {
        "mobile": 480,
        "desktop": {
            "slimnav": 100,
            "nobanner": 400
        }
    };
    var $els = {};
    var Navigation = {
        init: function () {
            this.copyMegaNavMenu();
            this.enableMegaNavToggle();
            this.replaceAllSectionsLink();

            if (detect.isIOS() && detect.getUserAgent.version > 5) {
                // crashes mobile safari < 6, so we add it here after detection
                fastdom.write(function () {
                    $('.navigation__scroll').css({'-webkit-overflow-scrolling': 'touch'});
                });
            }

            if (this.stickyNavAbParam()) {
                this.stickyNav();
            }
        },

        stickyNavAbParam: function () {
            return true;
        },

        copyMegaNavMenu: function () {
            var megaNavCopy = $.create($('.js-mega-nav').html()),
                placeholder = $('.js-mega-nav-placeholder');

            $('.global-navigation', megaNavCopy).addClass('global-navigation--top');

            fastdom.write(function () {
                placeholder.append(megaNavCopy);
            });
        },

        replaceAllSectionsLink: function () {
            $('.js-navigation-header .js-navigation-toggle').attr('href', '#nav-allsections');
        },

        enableMegaNavToggle: function () {
            bean.on(document, 'click', '.js-navigation-toggle', function (e) {
                var target = $('.' + e.currentTarget.getAttribute('data-target-nav'));

                e.preventDefault();
                fastdom.write(function () {
                    target.toggleClass('navigation-container--expanded navigation-container--collapsed');
                    mediator.emit(target.hasClass('navigation-container--expanded') ? 'modules:nav:open' : 'modules:nav:close');
                });
            });
        },

        stickyNav: function () {
            $els.header        = $('#header');
            $els.bannerDesktop = $('.top-banner-ad-container--above-nav');
            $els.bannerMobile  = $('.top-banner-ad-container--mobile');
            $els.main          = $('#maincontent');
            $els.navHeader     = $('.js-navigation-header');

            fastdom.write(function () {
                if (detect.getBreakpoint() === 'mobile') {
                    $els.bannerMobile.css({
                        position:  'fixed',
                        top:       $els.navHeader.dim().height,
                        width:     '100%',
                        'z-index': '1000'
                    });
                    $els.main.css('margin-top', $els.bannerMobile.dim().height);
                } else {

                    // Make sure that we show slim nav when page loaded with anchor
                    if (window.scrollY > stickyTresholds.desktop.slimnav) {
                        $els.header.css({
                            position:  'fixed',
                            top:       0,
                            width:     '100%',
                            'z-index': '1000'
                        });
                        $els.header.addClass('is-slim')
                    }
                }
            }.bind(this));

            mediator.on('window:scroll', _.throttle(function () {
                this.updateStickyNavPosition();
            }.bind(this), 10));
        },

        updateStickyNavPosition: function () {
            var headerHeight    = $els.navHeader.dim().height,
                bannerHeight;

            if (detect.getBreakpoint() === 'mobile') {
                fastdom.write(function () {
                    if (window.scrollY > stickyTresholds.mobile) {
                        $els.bannerMobile.css({
                            position: 'absolute',
                            top:      stickyTresholds.mobile + headerHeight
                        });
                    } else {
                        $els.bannerMobile.css({
                            position:  'fixed',
                            top:       headerHeight,
                            width:     '100%',
                            'z-index': '1000'
                        });
                        $els.header.css({
                            position:  'fixed',
                            top:       0,
                            width:     '100%',
                            'z-index': '1001'
                        });
                    }
                });
            } else {
                fastdom.write(function () {
                    bannerHeight = $els.bannerDesktop.dim().height;

                    // Add is collapsed, header is slim
                    if (window.scrollY > stickyTresholds.desktop.nobanner) {
                        // Add is not sticky anymore
                        $els.bannerDesktop.css({
                            position: 'absolute',
                            width: '100%',
                            top: stickyTresholds.desktop.nobanner
                        });

                        // Sync header movement with banner disapearing
                        $els.header.css({
                            top: Math.round(bannerHeight - (window.scrollY - stickyTresholds.desktop.nobanner))
                        });

                        // Banner is not visible anymore so stick header to the top of the viewport
                        if (window.scrollY > (stickyTresholds.desktop.nobanner + bannerHeight)) {
                            $els.header.css({
                                top: 0
                            });
                        };
                    // Top ad and header are visible in full height
                    } else {
                        // Make sure that banner and header are sticky
                        $els.bannerDesktop.css({
                            position:  'fixed',
                            top:       0,
                            width:     '100%',
                            'z-index': '1000'
                        });
                        $els.header.css({
                            position:  'fixed',
                            top:       bannerHeight,
                            width:     '100%',
                            'z-index': '1000'
                        });

                        // Make sure header is slim when needed
                        (window.scrollY > stickyTresholds.desktop.slimnav) ? $els.header.addClass('is-slim') : $els.header.removeClass('is-slim');
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
    };

    return Navigation;
});
