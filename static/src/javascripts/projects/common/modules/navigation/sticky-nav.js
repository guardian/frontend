define([
    'bean',
    'qwery',
    'fastdom',
    'common/modules/experiments/ab',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/$'
], function (
    bean,
    qwery,
    fastdom,
    ab,
    mediator,
    detect,
    $
) {
    var stickyNavBurger = {
        
    };

    // Sticky navigation test with all header features visible
    var stickyTresholds = {
        'mobile': 480,
        'desktop': {
            'slimnav': 100,
            'nobanner': 400
        }
    },
    $els = {};

    function stickyNavAll() {
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

    return {
        stickyNavBurger: stickyNavBurger,
        stickyNavAll: stickyNavAll
    };
});
