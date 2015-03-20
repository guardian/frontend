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

        function updatePosition($stickyNavigation, $stickyTopAd, stickyTopAdHeight, $header, $bannnerMobile) {
            var fixedNavTop, css, adCss,
                $belowNav = $('.top-banner-below-nav-mt-test'),
                totalNavOffset = $stickyNavigation[0].offsetTop + $header[0].offsetTop;

           // fixedNavTop = stickyNavOffsetTop - window.scrollY;
            console.log('window.scrollY: ' + window.scrollY, 'stickyTopAdHeight: ' + stickyTopAdHeight, '$stickyNavigationOffset: ' + (totalNavOffset - window.scrollY), 'totalNavOffset: ' + totalNavOffset, 'navOffset: ' + $stickyNavigation[0].offsetTop, 'headerOffset: ' + $header[0].offsetTop);

            $stickyTopAd.css({
                position:  'fixed',
                top:       0,
                width:     '100%',
                'z-index': '1001'
            });
            $header.css('margin-top', stickyTopAdHeight);

            if (window.scrollY < 500) {
                if ((totalNavOffset - window.scrollY) <= stickyTopAdHeight) {
                    $stickyNavigation.css({
                        position:  'fixed',
                        top:       stickyTopAdHeight,
                        width:     '100%',
                        'z-index': '1001'
                    });
                   // $bannnerMobile.css('margin-top', $stickyNavigation.dim().height);
                }
                else {
                    $stickyNavigation.css({
                        position:  null,
                        top:       null
                    });
                   // $bannnerMobile.css('margin-top', 0);
                }
            }
            else {
                $stickyTopAd.css({
                    position:  'absolute',
                    top:       500
                });
                if ($stickyNavigation.css('top') > 0) {
                    $stickyNavigation.css({
                        position:  'fixed',
                        top:       stickyTopAdHeight - (window.scrollY - 500)
                    });
                }

                //$bannnerMobile.css('margin-top', 0);

                if (window.scrollY > 500 + stickyTopAdHeight) {
                    $stickyNavigation.css({
                        position:  'fixed',
                        top:       0
                    });
                    // $bannnerMobile.css('margin-top', $stickyNavigation.dim().height);
                }
            }
        }

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    var $stickyNavigation = $('.sticky-nav-mt-test .navigation'),
                        $stickyTopAd = $('.sticky-nav-mt-test .top-banner-ad-container'),
                        $header = $('.sticky-nav-mt-test .l-header'),
                        $bannnerMobile = $('.top-banner-ad-container--mobile'),
                        stickyTopAdHeight = $stickyTopAd.dim().height,
                        stickyNavOffsetTop = $stickyNavigation[0].offsetTop + stickyTopAdHeight;

                    mediator.on('window:scroll', throttle(function() {
                        updatePosition($stickyNavigation, $stickyTopAd, stickyTopAdHeight, $header, $bannnerMobile)
                    }, 10));
                }
            }
        ];
    };

});
