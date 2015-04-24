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
    return function () {
        this.id = 'MtStickyNavAll';
        this.start = '2015-04-26';
        this.expiry = '2015-05-26';
        this.author = 'Steve Vadocz';
        this.description = 'Top navigation and top ad slot are sticky with navigation going to slim mode';
        this.audience = 0.02;
        this.audienceOffset = 0.3;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.edition === 'US';
        };

        this.variants = [
            {
                id: 'A',
                test: function () {
                    var stickyTresholds = {
                        'mobile': 480,
                        'desktop': {
                            'slimnav': 100,
                            'nobanner': 400
                        }
                    },
                    $els = {};

                    function stickyNav() {
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
                                        'z-index': '1000'
                                    });
                                    $els.header.css({
                                        position:  'fixed',
                                        top:       bannerHeight,
                                        width:     '100%',
                                        'z-index': '1000'
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

                    stickyNav();
                }
            },
            {
                id: 'B',
                test: function () { }
            }
        ];
    };
});
