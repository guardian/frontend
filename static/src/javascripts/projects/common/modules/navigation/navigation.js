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
            fastdom.write(function () {
                if (detect.getBreakpoint() === 'mobile') {
                    $('#header').addClass('l-header--sticky');
                    $('.top-banner-ad-container--mobile').addClass('top-banner-ad-container--sticky').css({
                            position:  'fixed',
                            top:       $('.js-navigation-header').dim().height,
                            width:     '100%',
                            'z-index': '1000'
                        });
                    $('#maincontent').css('margin-top', $('.js-navigation-header').dim().height + $('.top-banner-ad-container--mobile').dim().height);
                }
            }.bind(this));

            mediator.on('window:scroll', _.throttle(function () {
                this.updateStickyNavPosition();
            }.bind(this), 10));
        },

        updateStickyNavPosition: function () {
            var scrollThreshold = 480,
                headerHeight    = $('.js-navigation-header').dim().height;

            if (detect.getBreakpoint() === 'mobile') {
                fastdom.write(function () {
                    if (window.scrollY > scrollThreshold) {
                        $('.top-banner-ad-container--sticky').css({
                            position: 'absolute',
                            top:      scrollThreshold + headerHeight
                        });
                    } else {
                        $('.top-banner-ad-container--sticky').css({
                            position:  'fixed',
                            top:       headerHeight,
                            width:     '100%',
                            'z-index': '1000'
                        });
                    }
                });
            } else {
                fastdom.write(function () {
                    // Add is collapsed, header is slim
                    if (window.scrollY > 400) {
                        // Add is not sticky anymore
                        $('.top-banner-ad-container--above-nav').css({
                            position: 'absolute',
                            width: '100%',
                            top: 400
                        });

                        // Sync header movement with banner disapearing
                        $('#header').css({
                            top: bannerHeight - (window.scrollY - 400)
                        });

                        // Banner is not visible anymore so stick header to the top of the viewport
                        if (window.scrollY > (400 + bannerHeight)) {
                            $('#header').css({
                                top: 0
                            });
                        };
                    // Top ad and header are visible in full height
                    } else {
                        bannerHeight = $('.top-banner-ad-container--above-nav').dim().height;
                        $('#maincontent').css('margin-top', $('.js-navigation-header').dim().height + bannerHeight);

                        // Make sure that banner and header are sticky
                        $('.top-banner-ad-container--above-nav').css({
                            position:  'fixed',
                            top:       0,
                            width:     '100%',
                            'z-index': '1000'
                        });
                        $('#header').css({
                            position:  'fixed',
                            top:       bannerHeight,
                            width:     '100%',
                            'z-index': '1000'
                        });

                        // Make sure header is slim when needed
                        (window.scrollY > 100) ? $('#header').addClass('is-slim') : $('#header').removeClass('is-slim');
                    }
                });
            }
        }
    };

    return Navigation;
});
