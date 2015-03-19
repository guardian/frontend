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

        function updatePosition(stickyNavOffsetTop) {
            var fixedNavTop, css, adCss,
                $stickyNavWrapper = $('.sticky-nav-mt-test'),
                $stickyNavHeader = $('.sticky-nav-mt-test .gs-container.l-header__inner'),
                $stickyNavigation = $('.sticky-nav-mt-test .navigation'),
                $stickyTopAd = $('.sticky-nav-mt-test .top-banner-ad-container'),
                $belowNav = $('.top-banner-below-nav-mt-test');

            fixedNavTop = stickyNavOffsetTop - window.scrollY;
            console.log(stickyNavOffsetTop, window.scrollY, fixedNavTop);
            if (fixedNavTop > 0) {
                $stickyNavigation.css({
                    position:  'fixed',
                    top:       fixedNavTop,
                    width:     '100%',
                    'z-index': '1001'
                });
                $stickyTopAd.css({
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '1001'
                });
                $belowNav.css('margin-top', '291px');
            }

            //fixedNavTop = Math.min(this.opts.top, this.$parent[0].getBoundingClientRect().bottom - this.$element.dim().height);

            // have we scrolled past the nav
            /*if (window.scrollY >= 700) {
                // make sure the element stays within its parent

                adCss = {
                    position: null,
                    top:      null
                };
                $stickyNavAd.css(adCss);
            } else {
                css = {
                    position:  'fixed',
                    top:       0,
                    width:     '100%',
                    'z-index': '1001',
                    'margin-bottom': '291px'
                };
                $belowNav.css('margin-top', '291px');
            }

            $stickyNav.css(css)*/
        }

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    var $stickyNavigation = $('.sticky-nav-mt-test .navigation'),
                        $stickyTopAd = $('.sticky-nav-mt-test .top-banner-ad-container'),
                        stickyNavOffsetTop = $stickyNavigation[0].offsetTop + $stickyTopAd.dim().height;

                    mediator.on('window:scroll', throttle(function() {
                        updatePosition(stickyNavOffsetTop)
                    }, 10));
                }
            }
        ];
    };

});
