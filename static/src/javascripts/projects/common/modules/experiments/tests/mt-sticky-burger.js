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

        function showNavigation(scrollY, config) {
            if (scrollDirection(scrollY, config) === 'up') {
                config.$navigationScroll.css('display', 'block');
                config.$navigationGreySection.css('border-top', '36px solid #00456e');
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
                        showNavigation(window.scrollY, config);
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
                    showNavigation(window.scrollY, config);
                }
            });
        }

        function updatePositionMobile(config) {
            fastdom.write(function () {
                //header, navigation and banner are sticky from the beginning
                if (window.scrollY < config.scrollThreshold) {
                    config.$header.css({
                        position:  'fixed',
                        top:       0,
                        width:     '100%',
                        'z-index': '1001'
                    });
                    config.$bannerMobile.css({
                        position:  'fixed',
                        top:       config.stickyNavigationHeight,
                        width:     '100%',
                        'z-index': '1000'
                    });
                    config.$contentBelowMobile.css('margin-top', config.belowMobileMargin);
                } else {
                    //after config.scrollThreshold px of scrolling 'release' banner and navigation
                    config.$bannerMobile.css({
                        position:  'absolute',
                        top:       config.scrollThreshold
                    });
                    showNavigation(window.scrollY, config);
                }

                /*if (window.scrollY < config.scrollThreshold) {
                    //navigation is not sticky yet
                    config.$stickyNavigation.css({
                        position:  null,
                        top:       null
                    });
                    config.$bannerMobile.css('margin-top', null);
                    config.$bannerMobile.css({
                        position:  null,
                        top:       null
                    });
                    config.$contentBelowMobile.css('margin-top', null);

                    //when scroll will pass height of the header with logo
                    if (window.scrollY >= config.headerHeight) {
                        config.$stickyNavigation.css({
                            position:  'fixed',
                            top:       0,
                            width:     '100%',
                            'z-index': '1001'
                        });

                        //also banner below nav becomes sticky
                        config.$bannerMobile.css({
                            position:  'fixed',
                            top:       config.stickyNavigationHeight,
                            width:     '100%',
                            'z-index': '1000'
                        });
                        config.$contentBelowMobile.css('margin-top', config.belowMobileMargin);
                    }
                } else {
                    //after config.scrollThreshold px of scrolling 'release' banner below nav
                    config.$bannerMobile.css({
                        position:  'absolute',
                        top:       config.scrollThreshold
                    });
                }*/
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

                        fastdom.write(function () {
                            $('.sticky-nav-mt-test .l-header-main').css('overflow', 'hidden');
                            stickyConfig.headerHeight = stickyConfig.$header.dim().height;
                        });
                        stickyConfig.stickyNavigationHeight = stickyConfig.$stickyNavigation.dim().height;
                        stickyConfig.belowMobileMargin = stickyConfig.stickyNavigationHeight + stickyConfig.$bannerMobile.dim().height;

                        if (detect.getBreakpoint() === 'mobile') {
                            //burger icon is located on the right side of logo
                            fastdom.write(function () {
                                stickyConfig.$burgerIcon.css({
                                    'float': 'right',
                                    'margin': '8px 8px 0 0'
                                }).insertBefore(stickyConfig.$logoWrapper);
                                stickyConfig.$logoWrapper.css('margin', '12px 10px 4px 0');
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
