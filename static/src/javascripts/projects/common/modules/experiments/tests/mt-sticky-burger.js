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
        this.id = 'MtStickyBurger';
        this.start = '2015-04-21';
        this.expiry = '2015-05-21';
        this.author = 'Zofia Korcz';
        this.description = 'Sticky top banner with navigation - variant 1. with the burger icon';
        this.audience = 0.02;
        this.audienceOffset = 0.03;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            var isIE = detect.getUserAgent.browser === 'MSIE' || detect.getUserAgent === 'IE 11',
                isUS = config.page.edition === 'US';

            return !isIE && isUS;
        };

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

        /**
         * nothing happens in here, we just use this to bucket users
         */
        this.variants = [
            {
                id: 'A',
                test: function () {
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
                                scrollThreshold: config.page.contentType === 'Video' || config.page.contentType === 'Gallery' ? 280 : 480,
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
            },
            {
                id: 'B',
                test: function () { }
            }
        ];
    };

});
