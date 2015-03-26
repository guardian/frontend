define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/config'
], function (
    $,
    _,
    config
) {
    return function () {
        this.id = 'MtStickyBottom';
        this.start = '2015-03-26';
        this.expiry = '2015-05-26';
        this.author = 'Zofia Korcz';
        this.description = 'Top ad slot is sticky at the bottom of page';
        this.audience = 0.01;
        this.audienceOffset = 0.4;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.edition === 'US' && config.page.isFront;
        };

        function updatePosition(config) {
            if (window.scrollY < 500) {
                //topAd is sticky from the beginning
                config.$stickyTopAd.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '1001'
                });
                config.$header.css('margin-top', config.stickyTopAdHeight);

                //navigation is not sticky yet
                config.$stickyNavigation.css({
                    position:  null,
                    top:       null
                });
                config.$bannnerMobile.css('margin-top', null);

                //when scroll will pass height of the header with logo
                if (window.scrollY >= config.headerHeight) {
                    config.$stickyNavigation.css({
                        position:  'fixed',
                        top:       config.stickyTopAdHeight,
                        width:     '100%',
                        'z-index': '1001'
                    });
                    config.$bannnerMobile.css('margin-top', config.stickyNavigationHeight);
                }
            } else {
                //after 500px of scrolling 'release' topAd
                config.$stickyTopAd.css({
                    position:  'absolute',
                    top:       500
                });

                //move naigation toward top
                config.$stickyNavigation.css({
                    position:  'fixed',
                    top:       config.stickyTopAdHeight - (window.scrollY - 500)
                });

                //from now on, navigation stays on top
                if (window.scrollY > (500 + config.stickyTopAdHeight)) {
                    config.$stickyNavigation.css({
                        position:  'fixed',
                        top:       0
                    });
                }
            }
        }

        function updatePositionMobile(config) {
            if (window.scrollY < 500) {
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
                //after 500px of scrolling 'release' banner below nav
                config.$bannnerMobile.css({
                    position:  'absolute',
                    top:       500
                });
            }
        }

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    var stickyConfig = {
                            $stickyNavigation: $('.sticky-nav-mt-test .navigation'),
                            $stickyTopAd: $('.sticky-nav-mt-test .top-banner-ad-container'),
                            $header: $('.sticky-nav-mt-test .l-header__inner'),
                            $bannnerMobile: $('.top-banner-ad-container--mobile'),
                            $contentBelowMobile: $('#maincontent')
                        },
                        windowWidth = window.screen.width < window.outerWidth ? window.screen.width : window.outerWidth;

                    $('.sticky-nav-mt-test .l-header-main').css('overflow', 'hidden');
                    stickyConfig.stickyNavigationHeight = stickyConfig.$stickyNavigation.dim().height;
                    stickyConfig.headerHeight = stickyConfig.$header.dim().height;
                    stickyConfig.belowMobileMargin = stickyConfig.stickyNavigationHeight + stickyConfig.$bannnerMobile.dim().height;

                    if (windowWidth <= 740) {
                        updatePositionMobile(stickyConfig);

                        mediator.on('window:scroll', _.throttle(function () {
                            updatePositionMobile(stickyConfig);
                        }, 10));
                    } else {
                        mediator.on('window:scroll', _.throttle(function () {
                            //height of topAd needs to be recalculated because we don't know when we will get repspond from DFP
                            stickyConfig.stickyTopAdHeight = stickyConfig.$stickyTopAd.dim().height;
                            updatePosition(stickyConfig);
                        }, 10));
                    }
                }
            }
        ];
    };

});
