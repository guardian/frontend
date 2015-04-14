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
        this.id = 'MtStickyNav';
        this.start = '2015-03-26';
        this.expiry = '2015-04-26';
        this.author = 'Zofia Korcz';
        this.description = 'Top navigation and top ad slot are sticky';
        this.audience = 0.02;
        this.audienceOffset = 0.3;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            var isEditionUs = config.page.edition === 'US',
                isFixedSuported = $('html').hasClass('has-fixed');

            return isEditionUs && isFixedSuported;
        };

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
                    config.$header.css('margin-top', config.stickyTopAdHeight);

                    //navigation is not sticky yet
                    config.$stickyNavigation.css({
                        position: null,
                        top: null
                    });
                    config.$bannnerMobile.css('margin-top', null);

                    //when scroll will pass height of the header with logo
                    if (window.scrollY >= config.headerHeight) {
                        config.$stickyNavigation.css({
                            position: 'fixed',
                            top: config.stickyTopAdHeight,
                            width: '100%',
                            'z-index': '1001'
                        });
                        config.$bannnerMobile.css('margin-top', config.stickyNavigationHeight);
                    }
                } else {
                    //after config.scrollThreshold px of scrolling 'release' topAd
                    config.$stickyTopAd.css({
                        position: 'absolute',
                        top: config.scrollThreshold
                    });

                    //move navigation toward top
                    config.$stickyNavigation.css({
                        position: 'fixed',
                        top: config.stickyTopAdHeight - (window.scrollY - config.scrollThreshold)
                    });

                    //from now on, navigation stays on top
                    if (window.scrollY > (config.scrollThreshold + config.stickyTopAdHeight)) {
                        config.$stickyNavigation.css({
                            position: 'fixed',
                            top: 0
                        });
                    }
                }
            });
        }

        function updatePositionMobile(config) {
            fastdom.write(function () {
                if (window.scrollY < config.scrollThreshold) {
                    //navigation is not sticky yet
                    config.$stickyNavigation.css({
                        position:  null,
                        top:       null
                    });
                    config.$bannnerMobile.css('margin-top', null);
                    config.$bannnerMobile.css({
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
                        config.$bannnerMobile.css({
                            position:  'fixed',
                            top:       config.stickyNavigationHeight,
                            width:     '100%',
                            'z-index': '1000'
                        });
                        config.$contentBelowMobile.css('margin-top', config.belowMobileMargin);
                    }
                } else {
                    //after config.scrollThreshold px of scrolling 'release' banner below nav
                    config.$bannnerMobile.css({
                        position:  'absolute',
                        top:       config.scrollThreshold
                    });
                }
            });
        }

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    fastdom.read(function () {
                        var stickyConfig = {
                            $stickyNavigation: $('.sticky-nav-mt-test .navigation'),
                            $stickyTopAd: $('.sticky-nav-mt-test .top-banner-ad-container'),
                            $header: $('.sticky-nav-mt-test .l-header__inner'),
                            $bannnerMobile: $('.top-banner-ad-container--mobile'),
                            $contentBelowMobile: $('#maincontent'),
                            scrollThreshold: config.page.contentType === 'Video' ? 280 : 480
                        };

                        fastdom.write(function () {
                            $('.sticky-nav-mt-test .l-header-main').css('overflow', 'hidden');
                            stickyConfig.headerHeight = stickyConfig.$header.dim().height;
                        });
                        stickyConfig.stickyNavigationHeight = stickyConfig.$stickyNavigation.dim().height;
                        stickyConfig.belowMobileMargin = stickyConfig.stickyNavigationHeight + stickyConfig.$bannnerMobile.dim().height;

                        if (detect.getBreakpoint() === 'mobile') {
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
                id: 'control',
                test: function () { }
            }
        ];
    };

});
