define([
    'common/utils/$',
    'common/utils/config',
    'lodash/functions/throttle',
    'common/utils/mediator'
], function (
    $,
    config,
    throttle,
    mediator
) {
    return function () {
        this.id = 'MtStickyNav';
        this.start = '2015-03-19';
        this.expiry = '2015-05-19';
        this.author = 'Zofia Korcz';
        this.description = 'Top navigation and top ad slot are sticky';
        this.audience = 0.01;
        this.audienceOffset = 0.3;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.edition === 'US';
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
                if (window.scrollY >= config.$header.dim().height) {
                    config.$stickyNavigation.css({
                        position:  'fixed',
                        top:       config.stickyTopAdHeight,
                        width:     '100%',
                        'z-index': '1001'
                    });
                    config.$bannnerMobile.css('margin-top', config.$stickyNavigation.dim().height);
                }
            }
            else {
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
            console.log(config);
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

                //when scroll will pass height of the header with logo
                if (window.scrollY >= config.$header.dim().height) {
                    config.$stickyNavigation.css({
                        position:  'fixed',
                        top:       0,
                        width:     '100%',
                        'z-index': '1001'
                    });

                    //also banner below nav becomes sticky
                    config.$bannnerMobile.css({
                        position:  'fixed',
                        top:       config.$stickyNavigation.dim().height,
                        width:     '100%',
                        'z-index': '1001'
                    });
                }
            }
            else {
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
                            $bannnerMobile: $('.top-banner-ad-container--mobile')
                        },
                        windowWidth = window.screen.width < window.outerWidth ? window.screen.width : window.outerWidth;

                    $('.sticky-nav-mt-test .l-header-main').css('overflow', 'hidden');

                    //recalculate height of ad slot when it is fully rendered
                    /*mediator.on('modules:commercial:dfp:topAdRendered', function() {

                    });*/

                    if (windowWidth <= 740 ) {
                        mediator.on('window:scroll', throttle(function() {
                            updatePositionMobile(stickyConfig);
                        }, 10));
                    }
                    else {
                        mediator.on('window:scroll', throttle(function() {
                            stickyConfig.stickyTopAdHeight = stickyConfig.$stickyTopAd.dim().height;

                            updatePosition(stickyConfig);
                        }, 10));
                    }
                }
            }
        ];
    };

});
